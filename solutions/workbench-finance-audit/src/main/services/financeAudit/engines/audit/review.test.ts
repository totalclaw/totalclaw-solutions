/**
 * B4 复核 + P4 表格质检：audit-xls 夹具（#REF!、断链、硬编码、公式不一致、求和漏行、隐藏表）全部检出；三档范围；
 * LP 资本账户重算（手算见夹具注释）；交叉索引断链。
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import { auditWorkbook, formulaConstants, readWorkbookForAudit, relativePattern } from './review/xlsAudit';
import { parseLpStatements, parseNavFund, parseNavLp, tieOut } from './review/navTieout';
import { crossIndex } from './review/crossRef';
import { tableOf } from './testTable';
import * as FX from '../../__fixtures__/audit/data';

const DIR = mkdtempSync(join(tmpdir(), 'fau-b4-'));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));

describe('底稿质检（audit-xls 规则）', () => {
  const path = FX.writePaper(join(DIR, 'paper.xlsx'));
  const wb = readWorkbookForAudit(path);
  const model = auditWorkbook(wb, 'paper.xlsx', { scope: 'model' });
  const rules = (fs: typeof model.findings) => fs.map((f) => `${f.rule}@${f.sheet}!${f.cell}`);

  it('整个模型：埋入的问题全部检出', () => {
    const got = rules(model.findings);
    expect(got).toContain('error_value@底稿!E3');
    expect(got).toContain('broken_link@底稿!E2');
    for (const r of [2, 3, 4, 5, 6]) expect(got).toContain(`hardcode_in_formula@底稿!C${r}`);
    expect(got).toContain('inconsistent_formula@底稿!D4');
    expect(got).toContain('sum_range_gap@底稿!B7');
    expect(got).toContain('hidden_sheet@Hidden!');
    expect(model.findings.find((f) => f.rule === 'sum_range_gap')?.severity).toBe('critical');
  });

  it('单表与选区：只看指定范围（选区 C2:C6 只有硬编码，没有求和漏行）', () => {
    const sheet = auditWorkbook(wb, 'paper.xlsx', { scope: 'sheet', sheet: '底稿' });
    expect(rules(sheet.findings).some((x) => x.startsWith('hidden_sheet'))).toBe(false);
    const sel = auditWorkbook(wb, 'paper.xlsx', { scope: 'selection', sheet: '底稿', range: 'C2:C6' });
    expect(new Set(sel.findings.map((f) => f.rule))).toEqual(new Set(['hardcode_in_formula']));
  });

  it('不误报：函数的小整数参数（ROUND 位数）、0 / 1 / 100 不算硬编码；同一模式的公式不算不一致', () => {
    expect(formulaConstants('ROUND(B3+B4-B5,2)')).toEqual([]);
    expect(formulaConstants('IF(C3=0,"",ROUND(D3/C3,4))')).toEqual([]);
    expect(formulaConstants('B2*1.05+500')).toEqual(['1.05', '500']);
    expect(relativePattern('B2+C2', 1, 3)).toBe(relativePattern('B3+C3', 2, 3));
    const clean = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = { A1: { t: 'n', v: 1 }, A2: { t: 'n', v: 2 }, A3: { t: 'n', v: 3, f: 'SUM(A1:A2)' }, B1: { t: 'n', v: 2, f: 'A1*2' }, '!ref': 'A1:B3' };
    XLSX.utils.book_append_sheet(clean, ws, 'S');
    expect(auditWorkbook(clean, 'c.xlsx', { scope: 'model' }).findings).toEqual([]);
  });
});

describe('LP 资本账户重算（nav-tieout）', () => {
  const stmts = parseLpStatements(tableOf(FX.LP_HEAD, FX.LP_STATEMENTS, 'lpStatement'));
  const nav = parseNavLp(tableOf(FX.NAV_LP_HEAD, FX.NAV_LP, 'navLp'));
  const { fund, missing } = parseNavFund(tableOf(FX.NAV_FUND_HEAD, FX.NAV_FUND, 'navFund'));
  it('基金损益与净值读对', () => {
    expect(missing).toEqual([]);
    expect(fund).toEqual({ realized: 100_000_000, unrealized: 50_000_000, managementFee: 10_000_000, fundExpenses: 5_000_000, fundNav: 1_209_600_000 });
  });
  it('LP-01 一致放行；LP-02 分摊损益与期末差 1,350.00 → 暂扣；LP 期末合计 = 基金净值', () => {
    const r = tieOut(stmts, nav, fund, 1);
    const lp1 = r.lps.find((x) => x.lpId === 'LP-01')!;
    const lp2 = r.lps.find((x) => x.lpId === 'LP-02')!;
    expect([lp1.decision, lp2.decision]).toEqual(['release', 'hold']);
    expect(lp1.lines.find((l) => l.line === 'allocatedPnl')?.recomputed).toBe(81_000_000);
    expect(lp2.lines.filter((l) => !l.ok).map((l) => [l.line, l.diff])).toEqual([['allocatedPnl', 135_000], ['ending', 135_000]]);
    expect(lp2.lines.find((l) => l.line === 'ending')?.recomputed).toBe(448_600_000);
    expect([r.sumEnding, r.navTies]).toEqual([1_209_600_000, true]);
  });
});

describe('交叉索引', () => {
  it('B4-01 作为索引号标签存在 → 找到；B4-07 只被提到、哪里都没有 → 断链', () => {
    const refs = crossIndex([{ file: 'paper.xlsx', sheets: ['底稿'], cells: ['B4-01', '见 B4-01 与 B4-07 底稿'] }]);
    expect(refs.map((r) => `${r.ref}:${r.found}`)).toEqual(['B4-01:true', 'B4-07:false']);
  });
});
