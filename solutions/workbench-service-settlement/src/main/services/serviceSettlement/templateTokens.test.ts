/**
 * 模板变量随界面语言：{服务商} / {Provider} / {مزود_الخدمة} 三种写法都能被替换；中文默认模板与改动前一字不差。
 */
import { afterEach, describe, expect, it } from 'vitest';
import { setLocale } from '@totalclaw/i18n';
import { fillTemplate, renderInvoiceFileName } from './settlementSummary';
import { normalizeTemplateTokens, templateToken } from './templateTokens';
import { defaultInvoiceNameTemplate, defaultMailSubject } from './store';

afterEach(() => setLocale('zh-CN'));

describe('模板变量名跟随界面语言', () => {
  it('英文 / 阿语写法都还原成中文变量名再替换；英文不分大小写；不认识的变量原样保留', () => {
    expect(normalizeTemplateTokens('{Provider} {period} {مزود_الخدمة} {未知}')).toBe('{服务商} {结算期} {服务商} {未知}');
    const vars = { 服务商: 'ACME', 结算期: '2026-09', 应付合计: 100 };
    expect(fillTemplate('[{Period}] {Provider} {Payable}', vars)).toBe('[2026-09] ACME 100');
    expect(fillTemplate('{服务商}：{应付合计}', vars)).toBe('ACME：100');
    expect(renderInvoiceFileName('{Provider}_{Period}_{Seq}', { provider: 'ACME', period: '2026-09', index: 3, date: '20260901', originalName: 'a.PDF' })).toBe('ACME_2026-09_03.pdf');
  });

  it('默认模板：中文与改动前一致；英文用英文变量名且能被引擎替换', () => {
    setLocale('zh-CN');
    expect(defaultInvoiceNameTemplate()).toBe('{服务商}_{结算期}_发票{序号}');
    expect(defaultMailSubject()).toContain('{服务商}');
    setLocale('en-US');
    expect(templateToken('服务商', 'en-US')).toBe('{Provider}');
    const subject = defaultMailSubject();
    expect(subject).toContain('{Provider}');
    expect(subject).not.toMatch(/[一-鿿]/);
    expect(fillTemplate(subject, { 服务商: 'ACME', 结算期: '2026-09' })).toContain('ACME');
    expect(defaultInvoiceNameTemplate()).not.toMatch(/[一-鿿]/);
  });
});
