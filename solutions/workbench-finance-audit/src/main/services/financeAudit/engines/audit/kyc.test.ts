/** B6 客商尽调：阿语姓名规范化与名单匹配、抽取回原文核对（编造的字段丢弃）、规则网格与处置——处置从不批准。 */
import { describe, expect, it } from 'vitest';
import type { FauKycHit, FauKycRecord } from '@totalclaw/ipc-contracts';
import { FAU_KYC_DISPOSITIONS } from '@totalclaw/ipc-contracts';
import { thresholdsFor } from '../../thresholds';
import { nameSimilarity, normalizeName, parseWatchlist, screenNames } from './kyc/names';
import { evalGridRule, screen } from './kyc/rules';
import { verifyKyc } from './kyc/extract';
import { textDoc } from './docs';
import { tableOf } from './testTable';
import * as FX from '../../__fixtures__/audit/data';

const th = thresholdsFor('kyc');
const docs = [textDoc('license.txt', FX.KYC_LICENSE), textDoc('ubo.txt', FX.KYC_UBO), textDoc('address.txt', FX.KYC_ADDRESS)];
const v = (value: string, quote: string, docName: string) => ({ value, quote, docName });
const extracted = {
  applicantType: 'entity' as const,
  legalName: v('شركة الخليج للتجارة المحدودة', 'الاسم: شركة الخليج للتجارة المحدودة', 'license.txt'),
  dobOrFormation: v('2015-03-12', 'تاريخ التأسيس: 2015-03-12', 'license.txt'),
  jurisdiction: v('SA', 'بلد التأسيس: المملكة العربية السعودية', 'license.txt'),
  address: v('الرياض، طريق الملك فهد 12', 'العنوان: الرياض، طريق الملك فهد 12', 'license.txt'),
  // 编造：原文里没有这句 → 丢弃
  sourceOfFunds: v('أرباح تشغيلية', 'مصدر الأموال: أرباح تشغيلية', 'license.txt'),
  pepDeclared: false,
  idDocuments: [],
  beneficialOwners: [{ name: v('محمد أحمد العلي', 'المالك المستفيد: محمد أحمد العلي', 'ubo.txt'), nationality: 'SA', pct: 100 }],
  controllers: [],
  documents: [{ type: 'formation' as const, docName: 'license.txt', date: '2015-03-12' }, { type: 'ownership' as const, docName: 'ubo.txt', date: '' }, { type: 'address' as const, docName: 'address.txt', date: '2026-09-01' }, { type: 'other' as const, docName: 'invented.pdf', date: '' }],
};

describe('B6 姓名规范化与名单匹配', () => {
  it('阿语去音符、统一字母变体；英文去称谓与标点', () => {
    expect(normalizeName('مُحمّد أحمد العلي')).toBe(normalizeName('محمد احمد العلي'));
    expect(normalizeName('Mr. Mohammed  Al-Ali')).toBe('mohammed al ali');
    expect(nameSimilarity('Al-Ali Mohammed', 'Mohammed Al Ali')).toBe(1);
  });
  it('受益所有人阿语名强命中名单别名；无关的人不命中', () => {
    const list = parseWatchlist(tableOf(FX.WATCH_HEAD, FX.WATCHLIST, 'watchlist'));
    const hits = screenNames([{ name: 'محمد أحمد العلي', role: 'ubo' }, { name: 'Zhang Wei', role: 'controller' }], list, th);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ role: 'ubo', listName: 'UN Sanctions List', strength: 'strong' });
  });
});

describe('B6 抽取回原文核对', () => {
  it('值在引用里、引用在原文里才保留；编造的资金来源与文件名被丢弃', () => {
    const rec = verifyKyc(extracted, docs);
    expect(rec.legalName?.verified).toBe(true);
    expect(rec.jurisdiction?.value).toBe('SA');
    expect(rec.sourceOfFunds).toBeNull();
    expect(rec.dropped).toEqual(['sourceOfFunds']);
    expect(rec.documents.map((d) => d.docName)).toEqual(['license.txt', 'ubo.txt', 'address.txt']);
    expect(rec.beneficialOwners).toHaveLength(1);
  });
});

describe('B6 规则与处置：从不批准', () => {
  const rec = verifyKyc(extracted, docs);
  const strong: FauKycHit = { subject: 'محمد أحمد العلي', role: 'ubo', listName: 'UN Sanctions List', entry: 'Mohammed Ahmad Al-Ali', score: 1, strength: 'strong' };
  it('强命中制裁名单 → 建议拒绝；资金来源不清 → K6 触发', () => {
    const s = screen({ record: rec, hits: [strong], rules: null, asOf: FX.AS_OF, th });
    expect(s.disposition).toBe('decline-recommend');
    expect(s.rating).toBe('high');
    expect(s.outcomes.find((o) => o.ruleId === 'K6')?.outcome).toBe('fail');
  });
  it('无命中、文件齐全、资金来源清楚 → clear（无异常，仍由合规官决定）；缺资金来源 → 补件', () => {
    const ok: FauKycRecord = { ...rec, sourceOfFunds: { value: 'x', quote: 'x', docName: 'license.txt', verified: true } };
    expect(screen({ record: ok, hits: [], rules: null, asOf: FX.AS_OF, th }).disposition).toBe('clear');
    expect(screen({ record: rec, hits: [], rules: null, asOf: FX.AS_OF, th }).disposition).toBe('request-docs');
  });
  it('高风险司法辖区 → 升级强化尽调；地址证明超过 90 天 → 补件', () => {
    const ir: FauKycRecord = { ...rec, jurisdiction: { value: 'IR', quote: '', docName: '', verified: true }, sourceOfFunds: { value: 'x', quote: 'x', docName: 'd', verified: true } };
    expect(screen({ record: ir, hits: [], rules: null, asOf: FX.AS_OF, th }).disposition).toBe('escalate-EDD');
    const s = screen({ record: { ...rec, sourceOfFunds: ir.sourceOfFunds }, hits: [], rules: null, asOf: '2027-06-01', th });
    expect(s.outcomes.find((o) => o.ruleId === 'K8')?.outcome).toBe('fail');
    expect(s.disposition).toBe('request-docs');
  });
  it('任何输入下处置都在四种建议之内，从不出现批准', () => {
    const variants: FauKycRecord[] = [rec, { ...rec, applicantType: 'trust' }, { ...rec, pepDeclared: true }, { ...rec, beneficialOwners: [] }, { ...rec, applicantType: '' }];
    for (const r of variants) for (const hits of [[], [strong], [{ ...strong, strength: 'possible' as const }]]) {
      const d = screen({ record: r, hits, rules: null, asOf: FX.AS_OF, th }).disposition;
      expect(FAU_KYC_DISPOSITIONS).toContain(d);
      expect(d).not.toMatch(/approve|批准|اعتماد/i);
    }
  });
  it('企业规则表：引用规则号，字段 / 条件逐条判', () => {
    expect(evalGridRule({ ruleId: 'R-9', text: 'trust needs EDD', field: 'applicantType', op: 'equals', value: 'entity', effect: 'escalate' }, rec)).toMatchObject({ ruleId: 'R-9', outcome: 'fail' });
    expect(evalGridRule({ ruleId: 'R-10', text: 'UBO', field: 'ubo', op: 'gt', value: '3', effect: 'risk' }, rec).outcome).toBe('pass');
  });
});
