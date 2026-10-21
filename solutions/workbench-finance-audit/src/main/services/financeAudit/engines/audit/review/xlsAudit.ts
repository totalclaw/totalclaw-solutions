/**
 * 底稿 / 模型质检（audit-xls 的规则，B4 与 P4 共用；纯函数，入参是 SheetJS 工作簿）。
 *
 * 三档范围：selection（指定区域）/ sheet（单表）/ model（整个工作簿 + 模型完整性：资产负债平衡、隐藏表）。
 * 规则：错误值、公式里的硬编码、公式与相邻单元格不一致、公式列里粘贴的数值、求和区间漏行、跨表引用断链、
 * 隐藏行列与隐藏表、资产负债表不平。只报告，不改文件。
 */
import * as XLSX from 'xlsx';
import type { FauQcScope, FauQcSeverity, FauXlsFinding, FauXlsRule } from '@totalclaw/ipc-contracts';
import BS from './bsLabels.json';

const ERRORS = ['#REF!', '#VALUE!', '#N/A', '#DIV/0!', '#NAME?', '#NULL!', '#NUM!'];
/** 公式里允许出现的常数（取整位数、百分比换算之类） */
const ALLOWED_CONSTANTS = new Set(['0', '1', '2', '100']);

const SEVERITY: Record<FauXlsRule, FauQcSeverity> = {
  error_value: 'critical', broken_link: 'critical', sum_range_gap: 'critical', bs_unbalanced: 'critical',
  hardcode_in_formula: 'important', inconsistent_formula: 'important', pasted_value: 'important', hidden_sheet: 'important', hidden_rows: 'minor',
};

/** 资产负债表合计行的标签（中 / 英 / 阿），模型档用来找「资产总计」与「负债和权益总计」 */
const TOTAL_ASSETS = BS.totalAssets;
const TOTAL_LE = BS.totalLiabilitiesEquity;

export interface XlsAuditOptions { scope: FauQcScope; sheet?: string; range?: string; sumGapRows?: number }

interface Cell { r: number; c: number; f?: string; v: unknown; t: string; w?: string }

function cellsOf(ws: XLSX.WorkSheet, range?: XLSX.Range): Cell[] {
  const out: Cell[] = [];
  for (const [k, raw] of Object.entries(ws)) {
    if (k.startsWith('!')) continue;
    const a = XLSX.utils.decode_cell(k);
    if (range && (a.r < range.s.r || a.r > range.e.r || a.c < range.s.c || a.c > range.e.c)) continue;
    const cell = raw as XLSX.CellObject;
    out.push({ r: a.r, c: a.c, f: cell.f, v: cell.v, t: cell.t, w: cell.w });
  }
  return out;
}

/** 公式转相对引用形态（R[x]C[y]），用来比较相邻公式是否同一模式 */
export function relativePattern(f: string, r: number, c: number): string {
  return f.replace(/(\$?)([A-Z]{1,3})(\$?)(\d+)(?![\d(])/g, (_m, ca: string, col: string, ra: string, row: string) => {
    const cc = XLSX.utils.decode_col(col);
    const rr = Number(row) - 1;
    return `${ca ? `C${cc}` : `C[${cc - c}]`}${ra ? `R${rr}` : `R[${rr - r}]`}`;
  });
}

/** 去掉字符串、引用、函数名后剩下的数值常数 */
export function formulaConstants(f: string): string[] {
  const s = f
    .replace(/"[^"]*"/g, ' ')
    .replace(/'[^']*'!/g, ' ')
    .replace(/[A-Za-z_][A-Za-z0-9_.]*!/g, ' ')
    .replace(/\$?[A-Z]{1,3}\$?\d+(:\$?[A-Z]{1,3}\$?\d+)?/g, ' ')
    .replace(/[A-Za-z_][A-Za-z0-9_.]*\s*\(/g, ' (')
    // 函数的小整数参数（ROUND 位数、VLOOKUP 列号、INDEX 行列）不算硬编码；算式里的常数（*1.05、+500）才算
    .replace(/,\s*-?\d{1,2}\s*(?=[,)])/g, ',');
  return [...s.matchAll(/(?<![A-Za-z_\d.])\d+(\.\d+)?%?/g)].map((m) => m[0]).filter((x) => !ALLOWED_CONSTANTS.has(x.replace(/%$/, '')));
}

function isError(c: Cell): string | null {
  if (c.t === 'e') return c.w || '#ERROR';
  const text = String(c.w ?? c.v ?? '');
  const hit = ERRORS.find((e) => text === e);
  if (hit) return hit;
  if (c.f && c.f.includes('#REF!')) return '#REF!';
  return null;
}

function finding(file: string, sheet: string, r: number, c: number, rule: FauXlsRule, formula?: string, detail?: string): FauXlsFinding {
  const cell = XLSX.utils.encode_cell({ r, c });
  return { id: `${sheet}!${cell}:${rule}`, file, sheet, cell, rule, severity: SEVERITY[rule], formula, detail };
}

function isNumber(c: Cell | undefined): boolean {
  return !!c && !c.f && c.t === 'n' && typeof c.v === 'number';
}

/** 单列 SUM(X{a}:X{b}) 写在同一列、区间外紧挨着还有数值 → 漏行 */
function sumGaps(cells: Map<string, Cell>, c: Cell, gap: number): string | null {
  const m = /^\s*SUM\(\s*\$?([A-Z]{1,3})\$?(\d+)\s*:\s*\$?([A-Z]{1,3})\$?(\d+)\s*\)\s*$/i.exec(c.f || '');
  if (!m || m[1].toUpperCase() !== m[3].toUpperCase()) return null;
  const col = XLSX.utils.decode_col(m[1].toUpperCase());
  if (col !== c.c) return null;
  const a = Number(m[2]) - 1;
  const b = Number(m[4]) - 1;
  if (b >= c.r) return null;
  const at = (r: number) => cells.get(`${r}:${col}`);
  // 区间下沿到合计单元格之间还有数（漏了最后几行）
  for (let r = b + 1; r < c.r; r += 1) if (isNumber(at(r))) return 'end';
  // 区间上沿之上紧挨着还有连续数值（漏了开头几行）
  let above = 0;
  for (let r = a - 1; r >= 0 && isNumber(at(r)); r -= 1) above += 1;
  return above >= gap ? 'start' : null;
}

function bsCheck(file: string, sheet: string, cells: Cell[], found: FauXlsFinding[]): void {
  const label = (c: Cell, words: string[]) => typeof c.v === 'string' && words.some((w) => c.v && String(c.v).trim().toLowerCase().replace(/\s+/g, ' ') === w.toLowerCase());
  const a = cells.find((c) => label(c, TOTAL_ASSETS));
  const le = cells.find((c) => label(c, TOTAL_LE));
  if (!a || !le) return;
  const valuesRight = (row: number, fromCol: number) => cells.filter((c) => c.r === row && c.c > fromCol && typeof c.v === 'number').sort((x, y) => x.c - y.c);
  const av = valuesRight(a.r, a.c);
  const lv = valuesRight(le.r, le.c);
  for (const x of av) {
    const y = lv.find((z) => z.c === x.c);
    if (y && Math.abs((x.v as number) - (y.v as number)) > 0.005) {
      found.push(finding(file, sheet, x.r, x.c, 'bs_unbalanced', x.f, `${x.v} ≠ ${y.v}`));
    }
  }
}

export function auditWorkbook(wb: XLSX.WorkBook, file: string, opts: XlsAuditOptions): { findings: FauXlsFinding[]; sheets: number; formulas: number } {
  const findings: FauXlsFinding[] = [];
  const names = opts.scope === 'model' ? wb.SheetNames : [opts.sheet && wb.SheetNames.includes(opts.sheet) ? opts.sheet : wb.SheetNames[0]];
  const gap = opts.sumGapRows ?? 1;
  let formulas = 0;
  const sheetMeta = (wb.Workbook?.Sheets || []) as Array<{ name?: string; Hidden?: number }>;
  for (const name of names) {
    const ws = wb.Sheets[name];
    if (!ws) continue;
    const range = opts.scope === 'selection' && opts.range ? XLSX.utils.decode_range(opts.range) : undefined;
    const cells = cellsOf(ws, range);
    const map = new Map(cellsOf(ws).map((c) => [`${c.r}:${c.c}`, c]));
    const at = (r: number, c: number) => map.get(`${r}:${c}`);
    for (const c of cells) {
      const err = isError(c);
      if (err) findings.push(finding(file, name, c.r, c.c, 'error_value', c.f, err));
      if (!c.f) continue;
      formulas += 1;
      // 跨表引用：表不存在或外部工作簿
      for (const m of c.f.matchAll(/(?:'((?:[^']|'')+)'|([A-Za-z_\u0080-￿][\w.\u0080-￿]*))!/g)) {
        const target = (m[1] ?? m[2] ?? '').replace(/''/g, "'");
        if (/^\[.+\]/.test(target) || !wb.SheetNames.includes(target)) { findings.push(finding(file, name, c.r, c.c, 'broken_link', c.f, target)); break; }
      }
      const consts = formulaConstants(c.f);
      if (consts.length) findings.push(finding(file, name, c.r, c.c, 'hardcode_in_formula', c.f, consts.join(', ')));
      const gapAt = sumGaps(map, c, gap);
      if (gapAt) findings.push(finding(file, name, c.r, c.c, 'sum_range_gap', c.f, gapAt));
      // 与上下 / 左右邻居比较：两边同一模式、自己不同 → 不一致
      const pat = relativePattern(c.f, c.r, c.c);
      for (const [d1, d2] of [[[-1, 0], [1, 0]], [[0, -1], [0, 1]]] as const) {
        const p = at(c.r + d1[0], c.c + d1[1]);
        const n = at(c.r + d2[0], c.c + d2[1]);
        if (p?.f && n?.f) {
          const pp = relativePattern(p.f, p.r, p.c);
          if (pp === relativePattern(n.f, n.r, n.c) && pp !== pat) { findings.push(finding(file, name, c.r, c.c, 'inconsistent_formula', c.f)); break; }
        }
      }
    }
    // 公式列里夹着一个常数：上下都是同一模式的公式
    for (const c of cells) {
      if (c.f || c.t !== 'n') continue;
      const p = at(c.r - 1, c.c);
      const n = at(c.r + 1, c.c);
      if (p?.f && n?.f && relativePattern(p.f, p.r, p.c) === relativePattern(n.f, n.r, n.c)) findings.push(finding(file, name, c.r, c.c, 'pasted_value', undefined, String(c.v)));
    }
    const hiddenRows = (ws['!rows'] || []).map((r, i) => (r?.hidden ? i : -1)).filter((i) => i >= 0);
    const hiddenCols = (ws['!cols'] || []).map((r, i) => (r?.hidden ? i : -1)).filter((i) => i >= 0);
    if (hiddenRows.length || hiddenCols.length) findings.push({ ...finding(file, name, hiddenRows[0] ?? 0, hiddenCols[0] ?? 0, 'hidden_rows'), detail: `rows:${hiddenRows.map((r) => r + 1).join(',')} cols:${hiddenCols.map((c) => XLSX.utils.encode_col(c)).join(',')}` });
    if (opts.scope === 'model') bsCheck(file, name, cells, findings);
  }
  if (opts.scope === 'model') {
    wb.SheetNames.forEach((n, i) => {
      if ((sheetMeta[i]?.Hidden || 0) > 0) findings.push({ id: `${n}:hidden_sheet`, file, sheet: n, cell: '', rule: 'hidden_sheet', severity: SEVERITY.hidden_sheet });
    });
  }
  return { findings, sheets: names.length, formulas };
}

export function readWorkbookForAudit(path: string): XLSX.WorkBook {
  return XLSX.readFile(path, { cellFormula: true, cellStyles: true, cellDates: false });
}
