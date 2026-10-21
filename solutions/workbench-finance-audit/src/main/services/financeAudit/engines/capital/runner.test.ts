/**
 * G6 runner 的纯函数：录入校验（必填 / 范围 / 行数 / 默认值没确认来源）、事实回原文定位（定位不到丢弃）、
 * 叙述回核允许的数字、买卖评级措辞识别（不做投资建议）。
 */
import { describe, expect, it } from 'vitest';
import type { ExtractedDoc } from '../../../documentExtractor';
import { capSpec } from '../../../../../shared/financeAudit/capital/specs';
import { readInputs, sanitizeInputs } from './inputs';
import { adviceHit, allowedNumbers, locateFacts, stripYears } from './runner';
import { verifyNumbers } from '../../verify';

const spec = capSpec('valuation', 'dcf')!;
const label = (k: string) => k;

describe('G6 录入校验', () => {
  it('必填缺失、超出范围、行数不够都阻断；默认值没确认来源进提醒', () => {
    const r = readInputs(spec, { fields: { beta: { v: 9, src: { kind: 'manual' } }, taxRate: { v: 0.25, src: { kind: 'default' } } }, tables: { forecast: [] } }, label);
    const codes = r.issues.map((i) => i.code);
    expect(codes).toContain('missing_riskFree');
    expect(codes).toContain('range_beta');
    expect(codes).toContain('rows_forecast');
    expect(r.issues.find((i) => i.code === 'defaults')?.level).toBe('warn');
    expect(r.unsourced).toBe(1);
  });

  it('只留 spec 里登记的字段与列；公开来源必须是 http(s) 链接，否则按未注明来源', () => {
    const c = sanitizeInputs(spec, {
      fields: { beta: { v: '1.2', src: { kind: 'public', url: 'javascript:alert(1)' } }, evil: { v: 1, src: { kind: 'manual' } }, erp: { v: '5%', src: { kind: 'manual' } } },
      tables: { forecast: [{ cells: { year: '2027', ebit: '1,000', x: 'drop' }, src: { kind: 'upload', file: 'a.csv', row: 2 } }] },
    });
    expect(Object.keys(c.fields).sort()).toEqual(['beta', 'erp']);
    expect(c.fields.beta).toEqual({ v: 1.2, src: expect.objectContaining({ kind: 'default' }) });
    expect(c.fields.erp.v).toBeCloseTo(0.05, 12);
    expect(c.tables.forecast[0].cells).not.toHaveProperty('x');
    expect(c.tables.forecast[0].cells.ebit).toBe(1000);
  });
});

const doc = (fileName: string, text: string): ExtractedDoc => ({ fileName, kind: 'pdf', text, pages: [{ page: 3, text, items: [] }], sheets: [] });

describe('G6 事实回原文与叙述回核', () => {
  it('引文能定位且数值在引文里出现才保留；编造的引文或改过的数字丢弃', () => {
    const docs = [doc('annual-report.pdf', 'Revenue for 2025 was 1,234.5 million, up 12% year on year.')];
    const facts = locateFacts([
      { label: 'Revenue 2025', value: '1,234.5', doc: 'annual-report.pdf', quote: 'Revenue for 2025 was 1,234.5 million' },
      { label: 'Revenue 2025', value: '1,500', doc: 'annual-report.pdf', quote: 'Revenue for 2025 was 1,234.5 million' },
      { label: 'EBITDA', value: '300', doc: 'annual-report.pdf', quote: 'EBITDA reached 300 million' },
    ], docs);
    expect(facts.map((f) => f.located)).toEqual([true, false, false]);
    expect(facts[0].page).toBe(3);
  });

  it('叙述里的数字只能来自引擎结果、录入值、上游转交与已定位的事实；百分比按小数 × 100 比', () => {
    const allowed = allowedNumbers(
      { metrics: [{ id: 'ev', label: 'ev', value: 1431.8182, unit: 'money' }, { id: 'tv', label: 'tv', value: 0.8095, unit: 'pct' }], tables: [], flags: [] },
      { f: { riskFree: 0.04 }, t: { forecast: [] } }, spec, [], [],
    );
    expect(verifyNumbers('Enterprise value is 1,431.8 and the terminal value is 81.0% of it.', allowed.amounts, allowed.percents).ok).toBe(true);
    expect(verifyNumbers('Enterprise value is 1,600.0.', allowed.amounts, allowed.percents).missing).toEqual(['1,600.0']);
    // 年份不当金额核：「2025 年」「FY2026」摘掉，1,600.0 这类金额照核
    expect(verifyNumbers(stripYears('2025 年企业价值 1,431.8，FY2026 预计不变。'), allowed.amounts, allowed.percents).ok).toBe(true);
    expect(stripYears('收入 2,025.5')).toContain('2,025.5');
  });

  it('买卖评级与交易建议措辞（三语）会被识别；普通的「买方」不算', () => {
    expect(adviceHit('We initiate with a Buy rating on the shares.')).toBeTruthy();
    expect(adviceHit('我们给予公司“买入”评级。')).toBeTruthy();
    expect(adviceHit('建议客户增持该股票')).toBeTruthy();
    expect(adviceHit('ننصح بشراء السهم')).toBeTruthy();
    expect(adviceHit('Strategic buyers and financial buyers were ranked.')).toBeNull();
    expect(adviceHit('潜在买方名单按匹配度排序。')).toBeNull();
  });
});
