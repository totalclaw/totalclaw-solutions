/**
 * HS 编码候选检索：用随包的 HS2022 真表（resources/foreign-trade/hs2022.csv）。
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildHsTable, hsPath, hsSearch, hsTokens, parseHsCsv, validateHsCode } from './hsCodes';

const table = buildHsTable(parseHsCsv(readFileSync(join(__dirname, '..', '..', '..', '..', '..', '..', 'resources', 'foreign-trade', 'hs2022.csv'), 'utf-8')));
const codes = (q: string, n = 5) => hsSearch(table, q, n).map((c) => c.code);

describe('HS2022 表', () => {
  it('读出 5613 个六位子目', () => {
    expect(table.docs.length).toBe(5613);
    expect(table.byCode.get('853952')?.description).toContain('LED');
  });

  it('词干：复数归一', () => {
    expect(hsTokens('Lamps; bolts, washers and similar articles')).toEqual(['lamp', 'bolt', 'washer', 'article']);
  });
});

describe('关键词检索 Top-N', () => {
  it.each([
    ['LED lamp light source', '853952'],
    ['ceramic tableware mug', '691200'],
    ['steel bolts with nuts', '731816'],
    ['porcelain tableware', '691110'],
  ])('%s → 候选里有 %s', (q, code) => expect(codes(q, 10)).toContain(code));

  it('没有命中的查询返回空；分数在 0～1', () => {
    expect(hsSearch(table, 'zzzz qqqq')).toEqual([]);
    for (const c of hsSearch(table, 'LED lamp')) expect(c.score).toBeGreaterThan(0), expect(c.score).toBeLessThanOrEqual(1);
  });

  it('描述带上章与品目', () => {
    expect(hsPath(table, '853952')).toMatch(/^Electrical machinery.* › Lamps; .* › Lamps; light-emitting diode/);
  });
});

describe('人工确认的编码校验', () => {
  it('6～10 位、前 6 位必须存在', () => {
    expect(validateHsCode(table, '8539.52')).toMatchObject({ ok: true, code: '853952' });
    expect(validateHsCode(table, '8539520000')).toMatchObject({ ok: true, code: '8539520000' });
    expect(validateHsCode(table, '853')).toEqual({ ok: false, reason: 'format' });
    expect(validateHsCode(table, '850000')).toEqual({ ok: false, reason: 'unknown' });
  });
});
