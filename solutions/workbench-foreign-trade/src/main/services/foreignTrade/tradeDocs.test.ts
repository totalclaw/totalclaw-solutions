/**
 * PI / CI / 装箱单：金额、重量、大写金额与单据核对。
 *
 * 带「移植」字样的用例来自 Dangooy/trade-pipeline-skill（MIT）的 tests/test_amounts.py、test_writers.py、
 * test_b_fixes_2608b.py、test_c_fixes.py、test_validation.py，数值与断言照抄；
 * 夹具同 tests/conftest.py：第 1 行 50000 件 / 290 kg / 28.50，第 2 行 100000 件 / 280 kg / 12.00。
 */
import { describe, expect, it } from 'vitest';
import type { FtOrderDoc, FtTradeDocInput, FtTradeLine } from '@totalclaw/ipc-contracts';
import {
  amountFormula, amountToWords, buildCommercialInvoice, buildPackingList, buildProforma, computeAmount, computePacking,
  effectiveNetKg, layoutSheet, parseTradeSheet, pricingMode, validateTradeDocInput, validateTradeDocs, wordsToAmount, type SheetCell,
} from './tradeDocs';

const PACK = { kgPerCarton: 25, cartonsPerPallet: 36, palletWeightKg: 28, cartonTareKg: 0, cbmPerPallet: 0.528 };
const line = (over: Partial<FtTradeLine> = {}): FtTradeLine => ({ no: 1, model: 'M8x25', description: 'HEX HEAD BOLT DIN 933 M8x25 ZP', quantity: 50000, unit: 'PCS', unitPrice: 28.5, netWeightKg: 290, ...over });
function input(over: Partial<FtTradeDocInput> = {}): FtTradeDocInput {
  return {
    seller: { name: 'ACME EXPORT CO., LTD', address: '123 Export Road, Qingdao, China' },
    buyer: { name: 'Global Fasteners LLC', address: 'Chicago, IL, USA' },
    bank: { name: 'Bank of China Qingdao', accountNo: '1234567890', swift: 'BKCHCNBJXXX' },
    piNo: 'PI-TEST01', ciNo: 'CI-TEST01', date: '2026-05-19', currency: 'USD', priceUnit: 'USD/PC', incoterm: 'FOB',
    portOfLoading: 'QINGDAO, CHINA', portOfDestination: 'CHICAGO, USA', payment: '30% T/T deposit; 70% before shipment',
    packing: PACK, certificates: 'CO', lines: [
      line(),
      line({ no: 2, model: 'M10x30', description: 'HEX HEAD BOLT DIN 933 M10x30 ZP', quantity: 100000, unitPrice: 12, netWeightKg: 280 }),
    ],
    ...over,
  };
}

describe('计价方式与金额（移植 test_amounts.py）', () => {
  it.each([
    ['CNY/MPCS', 'per_mille'], ['USD/MPCS', 'per_mille'], ['USD/TON', 'per_ton'], ['CNY/TON', 'per_ton'],
    ['USD/PC', 'flat'], ['USD/PCS', 'flat'], ['', 'flat'], [null, 'flat'],
  ])('%s → %s', (pu, mode) => expect(pricingMode(pu as any)).toBe(mode));

  it('三条金额规则', () => {
    expect(computeAmount('CNY/MPCS', 50000, 290, 28.5)).toBeCloseTo(1425);
    expect(computeAmount('USD/TON', 50000, 290, 1200)).toBeCloseTo(348);
    expect(computeAmount('USD/PC', 50000, 290, 0.285)).toBeCloseTo(14250);
    expect(computeAmount('CNY/MPCS', 50000, 290, null)).toBe(0);
    expect(computeAmount('USD/TON', 50000, null, 1200)).toBe(0);
  });

  it('公式与数值同源', () => {
    const cells = { qty: 'N5', weight: 'O5', price: 'P5' };
    expect(amountFormula('CNY/MPCS', cells)).toBe('=N5/1000*P5');
    expect(amountFormula('USD/TON', cells)).toBe('=O5/1000*P5');
    expect(amountFormula('USD/PC', cells)).toBe('=N5*P5');
    // PI / CI 列位不同，公式结构必须一致
    for (const pu of ['CNY/MPCS', 'USD/TON', 'USD/PC']) {
      const pi = amountFormula(pu, { qty: 'L9', weight: 'M9', price: 'N9' }).replace('L9', 'Q').replace('M9', 'W').replace('N9', 'P');
      const ci = amountFormula(pu, { qty: 'N9', weight: 'O9', price: 'P9' }).replace('N9', 'Q').replace('O9', 'W').replace('P9', 'P');
      expect(pi).toBe(ci);
    }
  });

  it.each([
    ['CNY/MPCS', 50000 / 1000 * 28.5 + 100000 / 1000 * 12],
    ['USD/TON', 290 / 1000 * 28.5 + 280 / 1000 * 12],
    ['USD/PC', 50000 * 28.5 + 100000 * 12],
  ])('CI 合计按 %s 计价', (pu, expected) => {
    expect(buildCommercialInvoice(input({ priceUnit: pu })).table.total).toBeCloseTo(Math.round(expected * 100) / 100);
  });

  it('每行取整到分按 Excel 口径（8.265 → 8.27），合计等于各行之和', () => {
    const ci = buildCommercialInvoice(input({ priceUnit: 'USD/TON' }));
    expect(ci.table.lines.map((l) => l.amount)).toEqual([8.27, 3.36]);
    expect(ci.table.total).toBe(11.63);
  });
});

describe('大写金额（移植 test_amounts.py / test_writers.py）', () => {
  it('边界、负数、量级', () => {
    expect(amountToWords(0.995, 'USD')).toBe('USD ONE ONLY');
    expect(amountToWords(999.995, 'USD')).toBe('USD ONE THOUSAND ONLY');
    expect(amountToWords(-5.5, 'USD')).toBe('USD MINUS FIVE AND FIFTY CENTS ONLY');
    expect(amountToWords(1_000_000_000, 'USD')).toBe('USD ONE BILLION ONLY');
    const big = amountToWords(2 ** 40, 'USD');
    expect(big).toContain('ONE TRILLION');
    expect(big).not.toMatch(/THOUSAND THOUSAND|MILLION MILLION/);
    expect(amountToWords(0, 'USD')).toBe('USD ZERO ONLY');
    expect(amountToWords(0.004, 'USD')).toBe('USD ZERO ONLY');
    expect(amountToWords(100.1, 'USD')).toBe('USD ONE HUNDRED AND TEN CENTS ONLY');
    const r = amountToWords(1234.56, 'USD');
    for (const w of ['ONE THOUSAND', 'TWO HUNDRED', 'THIRTY', 'FOUR', 'FIFTY', 'SIX CENTS']) expect(r).toContain(w);
    expect(amountToWords(1000000, 'EUR')).toBe('EUR ONE MILLION ONLY');
    expect(amountToWords(500, 'USD')).not.toContain('CENTS');
  });

  it('大写还原成数字（核对用）', () => {
    for (const n of [0, 5.5, 100.1, 1234.56, 999.99, 1_000_000, 2_345_678.9, 1425]) expect(wordsToAmount(amountToWords(n, 'USD'))).toBeCloseTo(n);
    expect(wordsToAmount('SAY US DOLLARS ONE HUNDRED AND FIVE AND CENTS TWENTY ONLY')).toBeCloseTo(105.2);
    expect(wordsToAmount('SAY TOTAL USD TWO THOUSAND POINT FIVE ONLY')).toBeCloseTo(2000.5);
    expect(wordsToAmount('see attachment')).toBeNull();
  });
});

describe('装箱（移植 test_b_fixes_2608b.py / test_writers.py）', () => {
  it('行净重 = 每箱重 × 箱数，合计 = 各行之和', () => {
    const { rows, totals } = computePacking([line({ quantity: 1000, netWeightKg: 100 })], { ...PACK, kgPerCarton: 34 });
    expect(rows[0].cartons).toBe(3);
    expect(rows[0].kgPerCarton).toBeCloseTo(33.33);
    expect(rows[0].netWeightKg).toBeCloseTo(99.99);
    expect(Math.round(rows[0].kgPerCarton * rows[0].cartons * 100) / 100).toBe(rows[0].netWeightKg);
    expect(totals.netWeightKg).toBeCloseTo(99.99);
    const two = computePacking([line({ quantity: 1000, netWeightKg: 100 }), line({ no: 2, quantity: 1000, netWeightKg: 50 })], { ...PACK, kgPerCarton: 34 });
    expect(two.totals.netWeightKg).toBeCloseTo(99.99 + 50);
  });

  it('整除时没有偏差；按装箱数分箱优先', () => {
    expect(computePacking([line({ quantity: 1000, netWeightKg: 50 })], PACK).rows[0]).toMatchObject({ cartons: 2, kgPerCarton: 25, netWeightKg: 50 });
    expect(computePacking([line({ quantity: 1001, netWeightKg: 50, pcsPerCarton: 100 })], PACK).rows[0].cartons).toBe(11);
  });

  it('夹具：净重 570、托盘 1、毛重 = 净重 + 托盘自重', () => {
    const { totals } = computePacking(input().lines, PACK);
    expect(totals.cartons).toBe(24);
    expect(totals.pallets).toBe(1);
    expect(totals.netWeightKg).toBeCloseTo(570);
    expect(totals.grossWeightKg).toBeCloseTo(598);
  });

  it('空订单、0 重量（赠品）', () => {
    expect(() => computePacking([], PACK)).toThrow();
    expect(effectiveNetKg({ netWeightKg: 0, quantity: 5 })).toBe(0);
    expect(effectiveNetKg({ unitNetKg: 0.0058, quantity: 50000 })).toBeCloseTo(290);
    expect(effectiveNetKg({ quantity: 5 })).toBeNull();
  });

  it('CI 的净重毛重与装箱单同源（cross_doc 回归护栏）', () => {
    const ci = buildCommercialInvoice(input());
    const pl = buildPackingList(input());
    expect(ci.table.netWeightKg).toBe(pl.table.netWeightKg);
    expect(ci.table.grossWeightKg).toBe(pl.table.grossWeightKg);
    const docs: FtOrderDoc[] = [
      { id: 'c', kind: 'CI', name: 'CI.xlsx', path: '', table: ci.table },
      { id: 'p', kind: 'PL', name: 'PL.xlsx', path: '', table: pl.table },
      { id: 'i', kind: 'PI', name: 'PI.xlsx', path: '', table: buildProforma(input()).table },
    ];
    const findings = validateTradeDocs(docs).filter((f) => f.level === 'error');
    expect(findings).toEqual([]);
  });
});

describe('生成前检查（移植 test_validation.py）', () => {
  const ids = (i: FtTradeDocInput) => new Set(validateTradeDocInput(i).filter((f) => f.level === 'error').map((f) => f.rule));
  it('正常订单没有 error', () => expect(ids(input()).size).toBe(0));
  it('缺卖方 / 买方 / 条款 / 银行', () => {
    expect(ids(input({ seller: { name: '' } }))).toContain('R001');
    expect(ids(input({ buyer: { name: '' } }))).toContain('R002');
    expect(ids(input({ payment: '' }))).toContain('R003');
    expect(ids(input({ bank: { name: 'X', accountNo: '1', swift: '' } }))).toContain('R013');
    expect(ids(input({ bank: { name: 'X', accountNo: '1', swift: 'BKCH' } }))).toContain('R013');
  });
  it('缺单价、数量为 0、金额不大于 0', () => {
    expect(ids(input({ lines: [line({ unitPrice: undefined })] }))).toContain('R005');
    expect(ids(input({ lines: [line({ quantity: 0 })] }))).toContain('R006');
    expect(ids(input({ lines: [line({ unitPrice: 0 })] }))).toContain('R008');
  });
  it('缺重量按计价方式分级：吨价 error，其他 warning', () => {
    expect(ids(input({ priceUnit: 'USD/TON', lines: [line({ netWeightKg: undefined })] }))).toContain('R007');
    const f = validateTradeDocInput(input({ lines: [line({ netWeightKg: undefined })] })).find((x) => x.rule === 'R007');
    expect(f?.level).toBe('warning');
  });
  it('信用证只提醒人工审单；没记录证书需求给 info', () => {
    const f = validateTradeDocInput(input({ lcNumber: 'LC123', certificates: '' }));
    expect(f.find((x) => x.rule === 'R009')?.level).toBe('info');
    expect(f.find((x) => x.rule === 'R010')?.level).toBe('info');
  });
  it('HS 编码没人工确认不能进单据', () => {
    expect(ids(input({ lines: [line({ hsCode: '731815', hsConfirmed: false })] }))).toContain('R014');
    expect(ids(input({ lines: [line({ hsCode: '731815', hsConfirmed: true })] })).has('R014')).toBe(false);
    const pi = buildProforma(input({ lines: [line({ hsCode: '731815', hsConfirmed: false })] }));
    expect(pi.rows[0][3].v).toBe('');
  });
});

describe('排版与公式', () => {
  it('明细公式换成真实行号，合计是 SUM，缓存值与数值一致', () => {
    const doc = buildProforma(input());
    const aoa = layoutSheet(doc);
    const headerRow = aoa.findIndex((r) => r[0]?.v === 'No.');
    const first = aoa[headerRow + 1];
    expect(first[8]).toMatchObject({ f: `ROUND(E${headerRow + 2}*H${headerRow + 2},2)`, v: 1425000 });
    const total = aoa[headerRow + 3];
    expect(total[8].f).toBe(`SUM(I${headerRow + 2}:I${headerRow + 3})`);
    expect(total[8].v).toBe(2625000);
    const pl = layoutSheet(buildPackingList(input()));
    const plHead = pl.findIndex((r) => r[0]?.v === 'No.');
    expect(pl[plHead + 1][7].f).toBe(`F${plHead + 2}*G${plHead + 2}`);
    expect(pl[plHead + 3][8].f).toBe(`SUM(I${plHead + 2}:I${plHead + 3})+1*28`);
  });
});

const g = (rows: Array<Array<string | number | null | { f: string }>>): SheetCell[][] => rows.map((r, ri) => r.map((v, ci) => ({
  addr: `${String.fromCharCode(65 + ci)}${ri + 1}`,
  ...(v && typeof v === 'object' ? { f: v.f, v: null } : { v }),
})));

describe('上传单据的核对（tianji verify-docs 规则）', () => {
  const ciGrid = g([
    ['COMMERCIAL INVOICE'],
    ['No.', 'Description', 'Qty', 'Unit Price', 'Amount', 'N.W.'],
    [1, 'Bolt M8', 500, 2, 1000, 50],
    [2, 'Bolt M10', 300, 3, 900, 40],
    ['TOTAL', '', 800, '', 1950, 90],
    ['SAY: USD ONE THOUSAND NINE HUNDRED ONLY'],
  ]);
  it('读出明细、合计、大写；三方比对列出每一对不一致', () => {
    const t = parseTradeSheet(ciGrid)!;
    expect(t.lines).toHaveLength(2);
    expect(t.total).toBe(1950);
    expect(t.amountInWords).toContain('NINE HUNDRED');
    const f = validateTradeDocs([{ id: 'c', kind: 'CI', name: 'CI.xlsx', path: '', table: t }]);
    const msg = f.find((x) => x.rule === 'amount_3way')!.message;
    expect(msg).toContain('1900');
    expect(msg).toContain('1950');
    expect((msg.match(/≠/g) || []).length).toBe(2);
  });

  it('按序号配行，不按物理行序；数量不一致、找不到的行都列出；PL 无单价列明说跳过', () => {
    const ci = parseTradeSheet(ciGrid)!;
    const pl = parseTradeSheet(g([
      ['No.', 'Description', 'Qty', 'Cartons', 'N.W.', 'G.W.'],
      [2, 'Bolt M10', 300, 3, 40, 42],
      [1, 'Bolt M8', 5000, 5, 50, 52],
      [3, 'Washer', 10, 1, 1, 1.2],
      ['Total', '', 5310, 9, 91, 95.2],
    ]))!;
    const f = validateTradeDocs([{ id: 'c', kind: 'CI', name: 'CI', path: '', table: ci }, { id: 'p', kind: 'PL', name: 'PL', path: '', table: pl }]);
    expect(f.filter((x) => x.rule === 'qty')).toHaveLength(1);
    expect(f.some((x) => x.rule === 'unmatched_line' && x.message.includes('Washer'))).toBe(true);
    expect(f.some((x) => x.rule === 'price_skipped')).toBe(true);
    expect(f.some((x) => x.rule === 'total_nw')).toBe(true);
    expect(f.some((x) => x.rule === 'line_nw')).toBe(false);
  });

  it('公式没有缓存值：标无法核验，不当 0', () => {
    const t = parseTradeSheet(g([
      ['No.', 'Description', 'Qty', 'Unit Price', 'Amount'],
      [1, 'Bolt', 10, 2, { f: 'C2*D2' }],
      ['TOTAL', '', 10, '', { f: 'SUM(E2:E2)' }],
    ]))!;
    expect(t.uncached).toEqual(['E2', 'E3']);
    expect(t.lines[0].amount).toBeUndefined();
    const f = validateTradeDocs([{ id: 'c', kind: 'CI', name: 'CI', path: '', table: t }]);
    expect(f.some((x) => x.rule === 'uncached')).toBe(true);
    expect(f.some((x) => x.rule === 'amount_3way')).toBe(false);
  });

  it('欧洲数字格式（移植 test_c_fixes.py C4）', () => {
    const t = parseTradeSheet(g([
      ['No.', 'Description', 'Qty', 'Unit Price', 'Amount'],
      [1, 'Bolt', '1.000', '12,5', '12.500,00'],
      ['TOTAL', '', '', '', '12.500,00'],
    ]))!;
    expect(t.lines[0].unitPrice).toBe(12.5);
    expect(t.total).toBe(12500);
  });

  it('品名里带 total 的行不当合计行', () => {
    const t = parseTradeSheet(g([
      ['No.', 'Description', 'Qty', 'Amount'],
      [1, 'Total station TS-02', 2, 100],
      ['TOTAL', '', 2, 100],
    ]))!;
    expect(t.lines).toHaveLength(1);
    expect(t.total).toBe(100);
  });
});
