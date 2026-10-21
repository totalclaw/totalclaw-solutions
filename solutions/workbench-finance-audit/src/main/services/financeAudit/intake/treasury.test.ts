/**
 * 批次 6 数据接入：列定义 × 三语关键字齐全、与其它批次的列关键字文件不重名；夹具写成 xlsx 再导回来逐行一致（含枚举、比率、是否列）。
 * 应收 / 应付明细用批次 2 的 ar / ap（解析与列角色在批次 2），这里只核夹具经批次 2 解析后逐行一致。
 */
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import { readTable } from '../../serviceSettlement/excel';
import OURS from './columnKeywords.json';
import SUB from './subledgerKeywords.json';
import FPA from './fpaColumnKeywords.json';
import TAX from './taxColumnKeywords.json';
import KW from './treasuryKeywords.json';
import { TREASURY_SPECS, normEnum, parseTreasuryTable } from './treasury';
import { inspectFile, readAndParse } from './index';
import { openItemsXlsx, treasuryXlsx } from '../__fixtures__/treasury/toXlsx';
import * as F from '../__fixtures__/treasury';
import type { TreasuryKind } from '../engines/treasury/types';

const DIR = mkdtempSync(join(tmpdir(), 'fau-tr-intake-'));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));

const BATCH1 = OURS as unknown as Record<string, string[]>;
const OTHERS: Array<[string, Record<string, unknown>]> = [['columnKeywords.json', OURS], ['subledgerKeywords.json', SUB], ['fpaColumnKeywords.json', FPA], ['taxColumnKeywords.json', TAX]];
const MINE = Object.fromEntries(Object.entries(KW).filter(([k]) => !k.startsWith('_'))) as Record<string, string[]>;

describe('资金与金融风险数据集：列定义与关键字', () => {
  it('每个角色都有中 / 英 / 阿关键字（或复用批次 1 的那份），且与其它批次的关键字文件不重名（columns.ts 按键合并，重名会互相覆盖）', () => {
    for (const [f, kw] of OTHERS) for (const k of Object.keys(MINE)) expect(kw[k], `${k} 与 ${f} 重名`).toBeUndefined();
    for (const [kind, cols] of Object.entries(TREASURY_SPECS)) {
      for (const c of cols) {
        const words = MINE[c.key] || BATCH1[c.key];
        expect(words, `${kind}.${c.key} 没有关键字`).toBeTruthy();
        if (MINE[c.key]) {
          expect(words.some((w) => /\p{Script=Han}/u.test(w)), `${c.key} 缺中文`).toBe(true);
          expect(words.some((w) => /^[A-Za-z]/.test(w)), `${c.key} 缺英文`).toBe(true);
          expect(words.some((w) => /\p{Script=Arabic}/u.test(w)), `${c.key} 缺阿语`).toBe(true);
        }
      }
    }
  });

  it('枚举同义词：中 / 英 / 阿都能认，认不出返回 null', () => {
    expect([normEnum('fxKind', '外币应收'), normEnum('fxKind', 'Payable'), normEnum('fxKind', 'بيع آجل')]).toEqual(['receivable', 'payable', 'hedge_sell']);
    expect([normEnum('certainty', '确定'), normEnum('certainty', '可能'), normEnum('fxCertainty', '很可能')]).toEqual(['committed', 'possible', 'highly_probable']);
    expect([normEnum('operator', '≥'), normEnum('operator', '<='), normEnum('metric', '资产负债率')]).toEqual(['ge', 'le', 'debt_ratio']);
    expect(normEnum('liqCategory', '随便写')).toBeNull();
  });

  it('枚举认不出：必需列记阻断项（带行号），可选列按默认值并提醒', () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['币种', '敞口类型', '外币金额', '确定性'], ['USD', '什么', 100, '不知道'], ['USD', '应收', 200, '']]), 'S');
    const p = join(DIR, 'bad.xlsx');
    XLSX.writeFile(wb, p);
    const t = readTable(p);
    const ins = inspectFile(p, 'fx_exposure');
    const r = parseTreasuryTable('fx_exposure', t, ins.mapping);
    expect(r.issues.map((i) => [i.level, i.rows])).toEqual([['block', [2]], ['warn', [2]]]);
    expect(r.rows[1]).toMatchObject({ kind: 'receivable', certainty: 'firm', amount: 20000 });
  });
});

const CASES: Array<[TreasuryKind, Record<string, unknown>[]]> = [
  ['bank_balance', F.balances], ['cash_plan', F.cashPlan], ['payment_request', F.paymentRequests], ['credit_facility', F.facilities],
  ['liquidity_items', F.liquidityItems], ['fx_exposure', F.fxRows], ['loan', F.loans], ['covenant', F.covenants], ['fin_metrics', F.metrics],
  ['credit_exposure', F.exposures], ['inventory', F.inventory], ['investment', F.investments],
] as unknown as Array<[TreasuryKind, Record<string, unknown>[]]>;

describe.each([['ar', F.agingAr], ['ap', F.wcAp], ['ar', F.forecastAr], ['ap', F.forecastAp]] as const)('应收 / 应付夹具经批次 2 解析往返：%s', (kind, rows) => {
  it('自动认全必需列，导回来与夹具逐行一致', () => {
    const p = openItemsXlsx(join(DIR, `open-${kind}-${rows.length}.xlsx`), rows);
    const ins = inspectFile(p, kind);
    expect(ins.missing).toEqual([]);
    const got = readAndParse(p, kind, undefined, ins.mapping);
    expect(got.issues).toEqual([]);
    expect(got.rows).toEqual(rows);
  });
});

describe.each(CASES)('夹具往返：%s', (kind, rows) => {
  it('自动认全必需列，导回来与夹具逐行一致', () => {
    const p = treasuryXlsx(join(DIR, `${kind}.xlsx`), kind, rows);
    const ins = inspectFile(p, kind);
    expect(ins.missing).toEqual([]);
    const got = readAndParse(p, kind, undefined, ins.mapping);
    expect(got.issues).toEqual([]);
    expect(got.rows).toEqual(rows);
  });
});
