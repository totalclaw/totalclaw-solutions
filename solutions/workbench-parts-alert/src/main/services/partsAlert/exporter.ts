/**
 * 配件预警与补库 —— 导出文件。
 *
 *   采购订单_<日期>.xlsx          订单行 + 运算依据（每个配件的算式原文）——交给采购系统录入，应用不代提交
 *   库存状态与行动计划_<日期>.xlsx  全部配件的状态、行动计划与检验结果、算式依据
 */
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { t as i18nT } from '@totalclaw/i18n';
import type { PaPartResult, PaPartState, PaPlanGroup, PaReplenishLine, PaReview, PaSummary } from '@totalclaw/ipc-contracts';
import { PA_STATES } from '@totalclaw/ipc-contracts';
import { safeFileName, writeWorkbook, type OutSheet } from '../serviceSettlement/excel';
import { planGroupOf, planTextOf } from './plan';

export function stateLabel(s: PaPartState): string {
  return { stagnant: i18nT('库存呆滞'), redundant: i18nT('库存冗余'), healthy: i18nT('库存健康'), at_risk: i18nT('库存将缺货'), out_of_stock: i18nT('库存已缺货') }[s];
}

export function groupLabel(g: PaPlanGroup): string {
  return {
    stagnant: i18nT('呆滞库存处理建议'), redundant: i18nT('冗余库存处理建议'),
    shortage_transit: i18nT('有采购在途的管控举措'), shortage_none: i18nT('无采购在途的管控举措'),
  }[g];
}

export function reviewLabel(st: PaReview['status'] | undefined): string {
  return st === 'confirmed' ? i18nT('已确认') : st === 'rejected' ? i18nT('已驳回') : i18nT('未检验');
}

/** 同名文件已存在就加序号，不覆盖之前导出的 */
export function freeFile(dir: string, baseName: string, ext = '.xlsx'): string {
  mkdirSync(dir, { recursive: true });
  const base = safeFileName(baseName);
  let file = join(dir, `${base}${ext}`);
  for (let n = 2; existsSync(file) && n < 1000; n += 1) file = join(dir, `${base}-${n}${ext}`);
  return file;
}

const dateTag = (asOf: string): string => asOf.replace(/-/g, '');

export function buildOrderSheets(lines: PaReplenishLine[], asOf: string): OutSheet[] {
  const sel = lines.filter((l) => l.selected);
  return [
    {
      name: i18nT('订单行'),
      headers: [i18nT('行号'), i18nT('配件编码'), i18nT('配件名称'), i18nT('供应商'), i18nT('下单数量'), i18nT('单价'), i18nT('金额'), i18nT('期望到货日'), i18nT('库存状态'), i18nT('公式建议量'), i18nT('人工调整'), i18nT('运算基准日')],
      rows: sel.map((l, i) => [
        i + 1, l.partNo, l.partName, l.supplier, l.qty, l.unitPrice ?? '', l.amount ?? '', l.expectDate, stateLabel(l.state), l.suggestQty,
        l.qty !== l.suggestQty ? i18nT('建议 {a}，改为 {b}', { a: l.suggestQty, b: l.qty }) : '', asOf,
      ]),
    },
    {
      name: i18nT('运算依据'),
      headers: [i18nT('配件编码'), i18nT('配件名称'), i18nT('预计断货日'), i18nT('采购提前期（天）'), i18nT('算式依据')],
      rows: sel.map((l) => [l.partNo, l.partName, l.stockoutDate, l.leadDays, l.basis.join('\n')]),
      colWidths: [18, 22, 14, 16, 110],
    },
  ];
}

export function exportPurchaseOrder(dir: string, lines: PaReplenishLine[], asOf: string): string {
  if (!lines.some((l) => l.selected)) throw new Error(i18nT('补库清单里没有勾选任何配件'));
  const file = freeFile(dir, `${i18nT('采购订单')}_${dateTag(asOf)}`);
  writeWorkbook(file, buildOrderSheets(lines, asOf));
  return file;
}

export function buildPlanSheets(results: PaPartResult[], reviews: Record<string, PaReview>, summary: PaSummary): OutSheet[] {
  const order = new Map(PA_STATES.map((s, i) => [s, i]));
  const sorted = [...results].sort((a, b) => (order.get(a.state)! - order.get(b.state)!) || a.partNo.localeCompare(b.partNo));
  return [
    {
      name: i18nT('库存状态'),
      headers: [i18nT('配件编码'), i18nT('配件名称'), i18nT('库存状态'), i18nT('库存数量'), i18nT('在途数量'), i18nT('最早到货日'), i18nT('日均需求'), i18nT('可用天数'), i18nT('预计断货日'), i18nT('采购提前期（天）'), i18nT('最迟下单日'), i18nT('最近发货月份'), i18nT('建议补库量'), i18nT('建议补库金额'), i18nT('算式依据')],
      rows: sorted.map((r) => [
        r.partNo, r.partName, stateLabel(r.state), r.stockQty, r.inTransitQty, r.earliestEta, r.dailyDemand, r.coverDays ?? '', r.stockoutDate,
        r.leadDaysDefaulted ? i18nT('{n}（默认）', { n: r.leadDays }) : r.leadDays, r.latestOrderDate, r.lastShipMonth, r.suggestQty || '', r.suggestAmount ?? '', r.basis.join('\n'),
      ]),
    },
    {
      name: i18nT('行动计划'),
      headers: [i18nT('分类'), i18nT('配件编码'), i18nT('配件名称'), i18nT('库存状态'), i18nT('行动计划'), i18nT('检验结果'), i18nT('备注')],
      rows: sorted.filter((r) => planGroupOf(r)).map((r) => {
        const rv = reviews[r.partNo];
        return [groupLabel(planGroupOf(r)!), r.partNo, r.partName, stateLabel(r.state), planTextOf(r, rv), reviewLabel(rv?.status), rv?.remark || ''];
      }),
      colWidths: [24, 18, 22, 12, 80, 10, 30],
    },
    {
      name: i18nT('汇总'),
      headers: [i18nT('项目'), i18nT('数值')],
      rows: [
        [i18nT('运算基准日'), summary.asOf],
        [i18nT('配件总数'), summary.total],
        ...PA_STATES.map((s) => [stateLabel(s), summary.byState[s]] as [string, number]),
        [i18nT('建议补库配件数'), summary.replenishParts],
        [i18nT('建议补库数量'), summary.replenishQty],
        [i18nT('建议补库金额（有单价的部分）'), summary.replenishAmount],
        [i18nT('没有库存记录、按库存 0 处理的配件数'), summary.partsWithoutStockRow.length],
        [i18nT('没有采购提前期、用默认天数的配件数'), summary.partsWithDefaultLead.length],
      ],
    },
  ];
}

export function exportStatusPlan(dir: string, results: PaPartResult[], reviews: Record<string, PaReview>, summary: PaSummary): string {
  const file = freeFile(dir, `${i18nT('库存状态与行动计划')}_${dateTag(summary.asOf)}`);
  writeWorkbook(file, buildPlanSheets(results, reviews, summary));
  return file;
}
