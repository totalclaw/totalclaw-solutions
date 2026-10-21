/**
 * F1 估值建模的公式联动工作簿（第 16.3 节批次 7：xlsx 全公式联动，并用 audit-xls 规则自检）：
 *   DCF / LBO / 三表 / 可比公司：「假设」页放输入，计算页每个计算单元格都写公式（v 是引擎算好的值，打开即显示）；
 *   Checks 页用公式把关键结果与引擎结果对一遍，Excel 打开后 TRUE 表示公式与代码口径一致。
 * 社区版 SheetJS 不支持样式：输入与计算分 sheet，等价于 xlsx-author 的蓝 / 黑配色约定。
 */
import { i18nKey } from '@totalclaw/i18n';
import type { DcfResult, LboResult, Peer, TsIn, TsYear } from '../engines/capital/valuation';
import { peerMultiples, statsOf } from '../engines/capital/valuation';
import { addr, isFormula, ref, type XCell, type XSheet } from './xlsx';
import type { L } from './common';

export interface ModelSheets {
  sheets: XSheet[];
  checks: XCell[][];
  /** 计算页上必须是公式的单元格（自检：计算区不许写死数字） */
  calcCells: Array<{ sheet: string; r: number; c: number }>;
}

const R0 = 2; // 第 1 行草稿警示、第 2 行表头 → 数据从 0-based 第 2 行开始
const abs = (r: number, c: number) => addr(r, c).replace(/^([A-Z]+)(\d+)$/, '$$$1$$$2');
const near = (cellRef: string, v: number): XCell => ({ f: `ABS(${cellRef}-(${v}))<0.01`, v: true });

/** 计算页里所有公式单元格的位置（行号已加 R0） */
function formulaCells(sheet: string, rows: XCell[][]): ModelSheets['calcCells'] {
  return rows.flatMap((r, i) => r.map((c, j) => (isFormula(c) ? { sheet, r: R0 + i, c: j } : null)).filter((x): x is { sheet: string; r: number; c: number } => !!x));
}

function inputSheet(t: L, name: string, rows: Array<[string, XCell]>): XSheet {
  return { name, headers: [t(i18nKey('假设')), t(i18nKey('数值'))], rows: rows.map(([k, v]) => [k, v]) };
}

// ── DCF ──
export interface DcfModelIn { taxRate: number; riskFree: number; beta: number; erp: number; sizePremium: number; costDebt: number; debtWeight: number; g: number; exitMultiple: number; midYear: boolean; netDebt: number; shares: number | null; method: 'gordon' | 'exit' }

export function dcfModel(t: L, nIn: string, nCalc: string, d: DcfResult & { tvHigh?: number }, inp: DcfModelIn): ModelSheets {
  const tvHigh = d.tvHigh ?? 0.75;
  const I = (k: number) => ref(nIn, R0 + k, 1);
  const inRows: Array<[string, XCell]> = [
    [t(i18nKey('所得税率')), inp.taxRate], [t(i18nKey('无风险利率')), inp.riskFree], [t(i18nKey('贝塔系数')), inp.beta], [t(i18nKey('市场风险溢价')), inp.erp],
    [t(i18nKey('规模 / 特定风险溢价')), inp.sizePremium], [t(i18nKey('税前债务成本')), inp.costDebt], [t(i18nKey('目标负债占比 D/(D+E)')), inp.debtWeight],
    [t(i18nKey('股权成本')), { f: `${I(1)}+${I(2)}*${I(3)}+${I(4)}`, v: d.ke }],
    [t(i18nKey('税后债务成本')), { f: `${I(5)}*(1-${I(0)})`, v: d.kdAfterTax }],
    [t(i18nKey('WACC')), { f: `(1-${I(6)})*${I(7)}+${I(6)}*${I(8)}`, v: d.wacc }],
    [t(i18nKey('永续增长率')), inp.g], [t(i18nKey('退出 EV/EBITDA 倍数')), inp.exitMultiple], [t(i18nKey('期中折现')), inp.midYear ? 1 : 0],
    [t(i18nKey('净债务')), inp.netDebt], [t(i18nKey('总股本（股数，与金额同单位口径）')), inp.shares ?? ''],
    [t(i18nKey('终值方法')), inp.method === 'exit' ? t(i18nKey('退出倍数')) : t(i18nKey('永续增长'))],
  ];
  const WACC = I(9); const G = I(10); const MULT = I(11); const MID = I(12); const ND = I(13); const SH = I(14);
  const N = d.rows.length;
  const C = (i: number) => 1 + i;
  const R = (k: number) => R0 + k;
  const lines: Array<[string, (i: number) => XCell]> = [
    [t(i18nKey('年度')), (i) => d.rows[i].year],
    [t(i18nKey('收入')), (i) => d.rows[i].revenue],
    [t(i18nKey('息税前利润 EBIT')), (i) => d.rows[i].ebit],
    [t(i18nKey('税后经营利润')), (i) => ({ f: `${addr(R(2), C(i))}*(1-${I(0)})`, v: d.rows[i].nopat })],
    [t(i18nKey('折旧摊销')), (i) => d.rows[i].da],
    [t(i18nKey('资本开支')), (i) => d.rows[i].capex],
    [t(i18nKey('营运资本增加')), (i) => d.rows[i].nwcChange],
    [t(i18nKey('自由现金流')), (i) => ({ f: `${addr(R(3), C(i))}+${addr(R(4), C(i))}-${addr(R(5), C(i))}-${addr(R(6), C(i))}`, v: d.rows[i].fcff })],
    [t(i18nKey('折现期')), (i) => ({ f: `${i + 1}-0.5*${MID}`, v: d.rows[i].t })],
    [t(i18nKey('折现系数')), (i) => ({ f: `1/(1+${WACC})^${addr(R(8), C(i))}`, v: d.rows[i].df })],
    [t(i18nKey('现值')), (i) => ({ f: `${addr(R(7), C(i))}*${addr(R(9), C(i))}`, v: d.rows[i].pv })],
  ];
  const rows: XCell[][] = lines.map(([label, f]) => [label, ...Array.from({ length: N }, (_, i) => f(i))]);
  const last = (k: number) => addr(R(k), C(N - 1));
  const span = (k: number) => `${abs(R(k), C(0))}:${abs(R(k), C(N - 1))}`;
  rows.push([]);
  const S = R0 + rows.length;
  const tvF = inp.method === 'exit' ? `(${last(2)}+${last(4)})*${MULT}` : `${last(7)}*(1+${G})/(${WACC}-${G})`;
  rows.push(
    [t(i18nKey('预测期现金流现值合计')), { f: `SUM(${addr(R(10), C(0))}:${last(10)})`, v: d.sumPv }],
    [t(i18nKey('终值')), { f: tvF, v: d.tv }],
    [t(i18nKey('终值折现期')), { f: `${N}-0.5*${MID}`, v: d.tvPeriod }],
    [t(i18nKey('终值现值')), { f: `${addr(S + 1, 1)}/(1+${WACC})^${addr(S + 2, 1)}`, v: d.pvTv }],
    [t(i18nKey('企业价值')), { f: `${addr(S, 1)}+${addr(S + 3, 1)}`, v: d.ev }],
    [t(i18nKey('终值占企业价值')), { f: `${addr(S + 3, 1)}/${addr(S + 4, 1)}`, v: d.tvShare }],
    [t(i18nKey('净债务')), { f: ND, v: inp.netDebt }],
    [t(i18nKey('股权价值')), { f: `${addr(S + 4, 1)}-${addr(S + 6, 1)}`, v: d.equity }],
    [t(i18nKey('每股价值')), { f: `IF(N(${SH})>0,${addr(S + 7, 1)}/${SH},"")`, v: d.perShare ?? '' }],
    [],
    [d.grid.colLabel === 'g' ? t(i18nKey('企业价值敏感性：WACC × 永续增长率')) : t(i18nKey('企业价值敏感性：WACC × 退出倍数'))],
  );
  // 敏感性：每格一条完整的 DCF 公式（不用 Excel 数据表功能）；中间格 = 模型结果
  const H = R0 + rows.length;
  rows.push([t(i18nKey('WACC')), ...d.grid.cols.map((c, j): XCell => ({ f: d.grid.colLabel === 'g' ? `${G}+${(j - 2) * 0.005}` : `${MULT}+${j - 2}`, v: c }))]);
  d.grid.rows.forEach((w, i) => {
    const wCell = abs(H + 1 + i, 0);
    rows.push([{ f: `${WACC}+${(i - 2) * 0.005}`, v: w }, ...d.grid.cols.map((_, j): XCell => {
      const cCell = abs(H, 1 + j);
      const tv = d.grid.colLabel === 'g' ? `${abs(R(7), C(N - 1))}*(1+${cCell})/(${wCell}-${cCell})` : `(${abs(R(2), C(N - 1))}+${abs(R(4), C(N - 1))})*${cCell}`;
      return { f: `IFERROR(SUMPRODUCT(${span(7)}/(1+${wCell})^${span(8)})+${tv}/(1+${wCell})^${abs(S + 2, 1)},"")`, v: d.grid.ev[i][j] ?? '' };
    })]);
  });
  return {
    sheets: [inputSheet(t, nIn, inRows), { name: nCalc, headers: [t(i18nKey('项目')), ...d.rows.map((r) => r.year)], rows }],
    checks: [
      [t(i18nKey('公式算出的企业价值与引擎一致')), near(ref(nCalc, S + 4, 1), d.ev)],
      [t(i18nKey('公式算出的 WACC 与引擎一致')), near(WACC, d.wacc)],
      [t(i18nKey('敏感性表中间格等于模型结果')), near(ref(nCalc, H + 3, 3), d.ev)],
      [t(i18nKey('终值占企业价值不超过 {p0}'), { p0: `${Math.round(tvHigh * 100)}%` }), { f: `${ref(nCalc, S + 5, 1)}<=${tvHigh}`, v: d.tvShare <= tvHigh }],
      ...(inp.method === 'gordon' ? [[t(i18nKey('永续增长率小于 WACC')), { f: `${G}<${WACC}`, v: inp.g < d.wacc }] as XCell[]] : []),
    ],
    calcCells: formulaCells(nCalc, rows),
  };
}

// ── LBO ──
export interface LboModelIn { taxRate: number; entryEbitda: number; entryMultiple: number; feesPct: number; minCash: number; seniorX: number; seniorRate: number; seniorAmort: number; sweepPct: number; subX: number; subRate: number; exitMultiple: number }

export function lboModel(t: L, nIn: string, nCalc: string, d: LboResult, inp: LboModelIn): ModelSheets {
  const I = (k: number) => ref(nIn, R0 + k, 1);
  const inRows: Array<[string, XCell]> = [
    [t(i18nKey('所得税率')), inp.taxRate], [t(i18nKey('进入时 EBITDA')), inp.entryEbitda], [t(i18nKey('进入 EV/EBITDA 倍数')), inp.entryMultiple],
    [t(i18nKey('交易费用（占企业价值）')), inp.feesPct], [t(i18nKey('最低现金')), inp.minCash], [t(i18nKey('优先债（EBITDA 倍数）')), inp.seniorX],
    [t(i18nKey('优先债利率')), inp.seniorRate], [t(i18nKey('优先债每年强制还本（占初始本金）')), inp.seniorAmort], [t(i18nKey('超额现金扫款比例')), inp.sweepPct],
    [t(i18nKey('次级债（EBITDA 倍数）')), inp.subX], [t(i18nKey('次级债利率')), inp.subRate], [t(i18nKey('退出 EV/EBITDA 倍数')), inp.exitMultiple],
    [t(i18nKey('进入企业价值')), { f: `${I(1)}*${I(2)}`, v: d.ev }],
    [t(i18nKey('交易费用')), { f: `${I(12)}*${I(3)}`, v: d.fees }],
    [t(i18nKey('优先债')), { f: `${I(1)}*${I(5)}`, v: d.senior }],
    [t(i18nKey('次级债')), { f: `${I(1)}*${I(9)}`, v: d.sub }],
    [t(i18nKey('股权投入')), { f: `${I(12)}+${I(13)}+${I(4)}-${I(14)}-${I(15)}`, v: d.equity }],
  ];
  const N = d.rows.length;
  const C = (i: number) => 1 + i;
  const R = (k: number) => R0 + k;
  const A = (k: number, i: number) => addr(R(k), C(i));
  const prev = (k: number, i: number) => addr(R(k), C(i - 1));
  const lines: Array<[string, (i: number) => XCell]> = [
    [t(i18nKey('年度')), (i) => d.rows[i].year],
    ['EBITDA', (i) => d.rows[i].ebitda],
    [t(i18nKey('折旧摊销')), (i) => d.rows[i].da],
    [t(i18nKey('资本开支')), (i) => d.rows[i].capex],
    [t(i18nKey('营运资本增加')), (i) => d.rows[i].nwcChange],
    [t(i18nKey('优先债期初')), (i) => ({ f: i === 0 ? I(14) : prev(17, i), v: d.rows[i].seniorOpen })],
    [t(i18nKey('利息')), (i) => ({ f: `${A(5, i)}*${I(6)}+${I(15)}*${I(10)}`, v: d.rows[i].interest })],
    [t(i18nKey('息税前利润 EBIT')), (i) => ({ f: `${A(1, i)}-${A(2, i)}`, v: d.rows[i].ebit })],
    [t(i18nKey('税前利润')), (i) => ({ f: `${A(7, i)}-${A(6, i)}`, v: d.rows[i].ebt })],
    [t(i18nKey('所得税')), (i) => ({ f: `MAX(0,${A(8, i)})*${I(0)}`, v: d.rows[i].tax })],
    [t(i18nKey('净利润')), (i) => ({ f: `${A(8, i)}-${A(9, i)}`, v: d.rows[i].netIncome })],
    [t(i18nKey('可用于还债的现金')), (i) => ({ f: `${A(10, i)}+${A(2, i)}-${A(3, i)}-${A(4, i)}`, v: d.rows[i].cfads })],
    [t(i18nKey('强制还本')), (i) => ({ f: `MIN(${A(5, i)},${I(14)}*${I(7)})`, v: d.rows[i].mandatory })],
    [t(i18nKey('期初现金')), (i) => ({ f: i === 0 ? I(4) : prev(16, i), v: d.rows[i].cashOpen })],
    [t(i18nKey('可扫款现金')), (i) => ({ f: `MAX(0,${A(13, i)}+${A(11, i)}-${A(12, i)}-${I(4)})`, v: Math.max(0, d.rows[i].cashOpen + d.rows[i].cfads - d.rows[i].mandatory - inp.minCash) })],
    [t(i18nKey('现金扫款')), (i) => ({ f: `MIN(${A(5, i)}-${A(12, i)},${A(14, i)}*${I(8)})`, v: d.rows[i].sweep })],
    [t(i18nKey('期末现金')), (i) => ({ f: `${A(13, i)}+${A(11, i)}-${A(12, i)}-${A(15, i)}`, v: d.rows[i].cashClose })],
    [t(i18nKey('优先债期末')), (i) => ({ f: `${A(5, i)}-${A(12, i)}-${A(15, i)}`, v: d.rows[i].seniorClose })],
  ];
  const rows: XCell[][] = lines.map(([label, f]) => [label, ...Array.from({ length: N }, (_, i) => f(i))]);
  rows.push([]);
  const S = R0 + rows.length;
  const L1 = (k: number) => addr(R(k), C(N - 1));
  rows.push(
    [t(i18nKey('退出企业价值')), { f: `${L1(1)}*${I(11)}`, v: d.exitEv }],
    [t(i18nKey('退出时净债务')), { f: `${L1(17)}+${I(15)}-${L1(16)}`, v: d.exitNetDebt }],
    [t(i18nKey('退出股权价值')), { f: `${addr(S, 1)}-${addr(S + 1, 1)}`, v: d.exitEquity }],
    ['MOIC', { f: `${addr(S + 2, 1)}/${I(16)}`, v: d.moic }],
    ['IRR', { f: `IFERROR(${addr(S + 3, 1)}^(1/${N})-1,"")`, v: d.irr ?? '' }],
    [],
    [t(i18nKey('IRR 敏感性：进入倍数 × 退出倍数'))],
  );
  const H = R0 + rows.length;
  rows.push([t(i18nKey('进入倍数')), ...d.grid.exit.map((x, j): XCell => ({ f: `${I(11)}+${j - 2}`, v: x }))]);
  d.grid.entry.forEach((e, i) => {
    const eCell = abs(H + 1 + i, 0);
    rows.push([{ f: `${I(2)}+${i - 2}`, v: e }, ...d.grid.exit.map((_, j): XCell => {
      const xCell = abs(H, 1 + j);
      return { f: `IFERROR(((${abs(R(1), C(N - 1))}*${xCell}-${abs(S + 1, 1)})/(${I(1)}*${eCell}*(1+${I(3)})+${I(4)}-${I(14)}-${I(15)}))^(1/${N})-1,"")`, v: d.grid.irr[i][j] ?? '' };
    })]);
  });
  return {
    sheets: [inputSheet(t, nIn, inRows), { name: nCalc, headers: [t(i18nKey('项目')), ...d.rows.map((r) => r.year)], rows }],
    checks: [
      [t(i18nKey('公式算出的退出股权价值与引擎一致')), near(ref(nCalc, S + 2, 1), d.exitEquity)],
      ...(d.irr !== null ? [[t(i18nKey('公式算出的 IRR 与引擎一致')), near(ref(nCalc, S + 4, 1), d.irr)] as XCell[]] : []),
      [t(i18nKey('期末现金不为负')), { f: `MIN(${abs(R(16), C(0))}:${abs(R(16), C(N - 1))})>=0`, v: d.rows.every((r) => r.cashClose >= 0) }],
    ],
    calcCells: formulaCells(nCalc, rows),
  };
}

// ── 三表 ──
export function threeStatementModel(t: L, nIn: string, nCalc: string, years: TsYear[], inp: TsIn): ModelSheets {
  const keys: Array<[keyof TsIn, string]> = [
    ['revenue0', i18nKey('基期收入')], ['growth', i18nKey('收入增长率')], ['grossMargin', i18nKey('毛利率')], ['opexPct', i18nKey('期间费用率')], ['daPct', i18nKey('折旧率（占期初固定资产）')],
    ['capexPct', i18nKey('资本开支占收入')], ['dso', i18nKey('应收账款周转天数')], ['dio', i18nKey('存货周转天数（按营业成本）')], ['dpo', i18nKey('应付账款周转天数（按营业成本）')],
    ['taxRate', i18nKey('所得税率')], ['interestRate', i18nKey('借款利率')], ['payout', i18nKey('分红比例')], ['cash0', i18nKey('基期现金')], ['ppe0', i18nKey('基期固定资产净值')],
    ['debt0', i18nKey('基期借款')], ['ar0', i18nKey('基期应收账款')], ['inv0', i18nKey('基期存货')], ['ap0', i18nKey('基期应付账款')], ['debtRepay', i18nKey('每年偿还借款')],
  ];
  const idx = Object.fromEntries(keys.map(([k], i) => [k, i])) as Record<keyof TsIn, number>;
  const I = (k: keyof TsIn) => ref(nIn, R0 + idx[k], 1);
  const inRows: Array<[string, XCell]> = keys.map(([k, label]) => [t(label), inp[k] as number]);
  // 列：第 1 列基期（Y0），第 2.. 列预测年
  const N = years.length;
  const C = (i: number) => 1 + i; // i = 0 为基期
  const R = (k: number) => R0 + k;
  const A = (k: number, i: number) => addr(R(k), C(i));
  const P = (k: number, i: number) => addr(R(k), C(i - 1));
  const y = (i: number) => years[i - 1];
  const eq0 = inp.cash0 + inp.ar0 + inp.inv0 + inp.ppe0 - inp.ap0 - inp.debt0;
  type Line = [string, (i: number) => XCell, XCell];
  const L0 = (f: string, v: number): XCell => ({ f, v });
  const lines: Line[] = [
    [t(i18nKey('收入')), (i) => ({ f: `${P(0, i)}*(1+${I('growth')})`, v: y(i).revenue }), L0(I('revenue0'), inp.revenue0)],
    [t(i18nKey('营业成本')), (i) => ({ f: `${A(0, i)}*(1-${I('grossMargin')})`, v: y(i).cogs }), ''],
    [t(i18nKey('毛利')), (i) => ({ f: `${A(0, i)}-${A(1, i)}`, v: y(i).gross }), ''],
    [t(i18nKey('期间费用')), (i) => ({ f: `${A(0, i)}*${I('opexPct')}`, v: y(i).opex }), ''],
    ['EBITDA', (i) => ({ f: `${A(2, i)}-${A(3, i)}`, v: y(i).ebitda }), ''],
    [t(i18nKey('折旧摊销')), (i) => ({ f: `${P(13, i)}*${I('daPct')}`, v: y(i).da }), ''],
    [t(i18nKey('息税前利润 EBIT')), (i) => ({ f: `${A(4, i)}-${A(5, i)}`, v: y(i).ebit }), ''],
    [t(i18nKey('利息')), (i) => ({ f: `${P(15, i)}*${I('interestRate')}`, v: y(i).interest }), ''],
    [t(i18nKey('所得税')), (i) => ({ f: `MAX(0,${A(6, i)}-${A(7, i)})*${I('taxRate')}`, v: y(i).tax }), ''],
    [t(i18nKey('净利润')), (i) => ({ f: `${A(6, i)}-${A(7, i)}-${A(8, i)}`, v: y(i).netIncome }), ''],
    [t(i18nKey('分红')), (i) => ({ f: `MAX(0,${A(9, i)})*${I('payout')}`, v: y(i).dividends }), ''],
    [t(i18nKey('应收账款')), (i) => ({ f: `${A(0, i)}*${I('dso')}/365`, v: y(i).ar }), L0(I('ar0'), inp.ar0)],
    [t(i18nKey('存货')), (i) => ({ f: `${A(1, i)}*${I('dio')}/365`, v: y(i).inv }), L0(I('inv0'), inp.inv0)],
    [t(i18nKey('固定资产净值')), (i) => ({ f: `${P(13, i)}+${A(14, i)}-${A(5, i)}`, v: y(i).ppe }), L0(I('ppe0'), inp.ppe0)],
    [t(i18nKey('资本开支')), (i) => ({ f: `${A(0, i)}*${I('capexPct')}`, v: y(i).capex }), ''],
    [t(i18nKey('借款')), (i) => ({ f: `${P(15, i)}-MIN(${P(15, i)},${I('debtRepay')})`, v: y(i).debt }), L0(I('debt0'), inp.debt0)],
    [t(i18nKey('应付账款')), (i) => ({ f: `${A(1, i)}*${I('dpo')}/365`, v: y(i).ap }), L0(I('ap0'), inp.ap0)],
    [t(i18nKey('所有者权益')), (i) => ({ f: `${P(17, i)}+${A(9, i)}-${A(10, i)}`, v: y(i).equity }), L0(`${I('cash0')}+${I('ar0')}+${I('inv0')}+${I('ppe0')}-${I('ap0')}-${I('debt0')}`, eq0)],
    [t(i18nKey('经营活动现金流')), (i) => ({ f: `${A(9, i)}+${A(5, i)}-(${A(11, i)}-${P(11, i)})-(${A(12, i)}-${P(12, i)})+(${A(16, i)}-${P(16, i)})`, v: y(i).cfo }), ''],
    [t(i18nKey('投资活动现金流')), (i) => ({ f: `-${A(14, i)}`, v: y(i).cfi }), ''],
    [t(i18nKey('筹资活动现金流')), (i) => ({ f: `-(${P(15, i)}-${A(15, i)})-${A(10, i)}`, v: y(i).cff }), ''],
    [t(i18nKey('现金')), (i) => ({ f: `${P(21, i)}+${A(18, i)}+${A(19, i)}+${A(20, i)}`, v: y(i).cash }), L0(I('cash0'), inp.cash0)],
    [t(i18nKey('资产合计')), (i) => ({ f: `${A(21, i)}+${A(11, i)}+${A(12, i)}+${A(13, i)}`, v: y(i).assets }), ''],
    [t(i18nKey('负债与权益合计')), (i) => ({ f: `${A(16, i)}+${A(15, i)}+${A(17, i)}`, v: y(i).liabEq }), ''],
    [t(i18nKey('资产 = 负债 + 权益')), (i) => ({ f: `ABS(${A(22, i)}-${A(23, i)})<0.001`, v: y(i).balanced }), ''],
  ];
  const rows: XCell[][] = lines.map(([label, f, base]) => [label, base, ...Array.from({ length: N }, (_, j) => f(j + 1))]);
  const checkRow = R(24);
  return {
    sheets: [inputSheet(t, nIn, inRows), { name: nCalc, headers: [t(i18nKey('项目')), 'Y0', ...years.map((x) => `Y${x.year}`)], rows }],
    checks: [
      [t(i18nKey('每年资产 = 负债 + 权益')), { f: `AND(${abs(checkRow, C(1))}:${abs(checkRow, C(N))})`, v: years.every((x) => x.balanced) }],
      [t(i18nKey('公式算出的末年现金与引擎一致')), near(ref(nCalc, R(21), C(N)), years[N - 1].cash)],
    ],
    calcCells: formulaCells(nCalc, rows).filter((c) => c.c >= 2),
  };
}

// ── 可比公司 ──
export function compsModel(t: L, nIn: string, nCalc: string, peers: Peer[], target: { ebitda: number | null; revenue: number | null; netIncome: number | null; netDebt: number }): ModelSheets {
  const I = (k: number) => ref(nIn, R0 + k, 1);
  const inRows: Array<[string, XCell]> = [
    [t(i18nKey('目标公司收入')), target.revenue ?? ''], [t(i18nKey('目标公司 EBITDA')), target.ebitda ?? ''], [t(i18nKey('目标公司净利润')), target.netIncome ?? ''], [t(i18nKey('目标公司净债务')), target.netDebt],
  ];
  const rows: XCell[][] = peers.map((p, i) => {
    const r = R0 + i;
    const m = peerMultiples(p);
    return [p.name, p.ev, p.marketCap ?? '', p.revenue ?? '', p.ebitda ?? '', p.netIncome ?? '',
      { f: `IF(N(${addr(r, 3)})>0,${addr(r, 1)}/${addr(r, 3)},"NM")`, v: m.evRevenue ?? 'NM' },
      { f: `IF(N(${addr(r, 4)})>0,${addr(r, 1)}/${addr(r, 4)},"NM")`, v: m.evEbitda ?? 'NM' },
      { f: `IF(AND(N(${addr(r, 2)})>0,N(${addr(r, 5)})>0),${addr(r, 2)}/${addr(r, 5)},"NM")`, v: m.pe ?? 'NM' }];
  });
  const first = R0;
  const lastR = R0 + peers.length - 1;
  const col = (c: number) => `${abs(first, c)}:${abs(lastR, c)}`;
  const vals = (k: 'evRevenue' | 'evEbitda' | 'pe') => peers.map((p) => peerMultiples(p)[k]).filter((x): x is number => x !== null);
  rows.push([]);
  const S = R0 + rows.length;
  const stat = (label: string, fn: string, pick: (s: ReturnType<typeof statsOf>) => number | null): XCell[] => [label, '', '', '', '', '',
    ...([6, 7, 8] as const).map((c, j): XCell => ({ f: `IFERROR(${fn.replace('#', col(c))},"")`, v: pick(statsOf(vals((['evRevenue', 'evEbitda', 'pe'] as const)[j]))) ?? '' }))];
  rows.push(
    stat(t(i18nKey('样本数')), 'COUNT(#)', (s) => s.n),
    stat(t(i18nKey('最小值')), 'MIN(#)', (s) => s.min),
    stat(t(i18nKey('下四分位')), 'QUARTILE.INC(#,1)', (s) => s.q1),
    stat(t(i18nKey('中位数')), 'MEDIAN(#)', (s) => s.median),
    stat(t(i18nKey('平均值')), 'AVERAGE(#)', (s) => s.mean),
    stat(t(i18nKey('上四分位')), 'QUARTILE.INC(#,3)', (s) => s.q3),
    stat(t(i18nKey('最大值')), 'MAX(#)', (s) => s.max),
    [],
  );
  const ebitdaStats = statsOf(vals('evEbitda'));
  const imp = (row: number, v: number | null): XCell => ({ f: `IFERROR(${I(1)}*${addr(row, 7)}-${I(3)},"")`, v: v === null || target.ebitda === null ? '' : v * target.ebitda - target.netDebt });
  rows.push(
    [t(i18nKey('隐含股权价值（EV/EBITDA 下四分位）')), imp(S + 2, ebitdaStats.q1)],
    [t(i18nKey('隐含股权价值（EV/EBITDA 中位数）')), imp(S + 3, ebitdaStats.median)],
    [t(i18nKey('隐含股权价值（EV/EBITDA 上四分位）')), imp(S + 5, ebitdaStats.q3)],
  );
  return {
    sheets: [inputSheet(t, nIn, inRows), { name: nCalc, headers: [t(i18nKey('公司')), t(i18nKey('企业价值')), t(i18nKey('市值')), t(i18nKey('收入')), 'EBITDA', t(i18nKey('净利润')), 'EV/Revenue', 'EV/EBITDA', 'P/E'], rows }],
    checks: ebitdaStats.median !== null ? [[t(i18nKey('公式算出的 EV/EBITDA 中位数与引擎一致')), near(ref(nCalc, S + 3, 7), ebitdaStats.median)]] : [],
    calcCells: formulaCells(nCalc, rows),
  };
}

/**
 * 公式自检（audit-xls 的结构规则，写出前在内存里跑）：
 *   引用的工作表都存在、没有 #REF!、计算区单元格都是公式（不许写死数字）。
 */
export function auditFormulas(sheets: XSheet[], calcCells: ModelSheets['calcCells']): Array<{ id: string; ok: boolean }> {
  const names = new Set(sheets.map((s) => s.name));
  const formulas = sheets.flatMap((s) => s.rows.flat().filter(isFormula).map((c) => c.f));
  const refsOk = formulas.every((f) => [...f.matchAll(/'((?:[^']|'')+)'!/g)].every((m) => names.has(m[1].replace(/''/g, "'"))));
  const noRef = formulas.every((f) => !f.includes('#REF!'));
  const byName = new Map(sheets.map((s) => [s.name, s]));
  const calcOk = calcCells.every((c) => {
    const s = byName.get(c.sheet);
    const cell = s?.rows[c.r - R0]?.[c.c];
    return !!cell && isFormula(cell);
  });
  return [{ id: 'refs', ok: refsOk }, { id: 'noref', ok: noRef }, { id: 'calc', ok: calcOk && calcCells.length > 0 }];
}
