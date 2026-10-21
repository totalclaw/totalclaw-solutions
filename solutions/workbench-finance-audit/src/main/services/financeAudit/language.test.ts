import { describe, expect, it } from 'vitest';
import { checkOutputLanguage } from './language';

describe('输出语言检查（第 13.3 节）', () => {
  it('中文：通过 / 不通过', () => {
    expect(checkOutputLanguage('管理费用较上月增加 48,000.00 元，主要是华南物业的 8 月房租在本月入账。', 'zh-CN').ok).toBe(true);
    expect(checkOutputLanguage('Admin expenses rose by 48,000 because the August rent was booked in September.', 'zh-CN').ok).toBe(false);
  });

  it('英文：通过 / 不通过；引号里的中文单位名与调用方给的用户数据不算', () => {
    expect(checkOutputLanguage('Admin expenses rose by 48,000.00, mainly because the August rent (voucher 记-0001) was booked in September.', 'en-US').ok).toBe(true);
    expect(checkOutputLanguage('Rent paid to “华南物业” for August was booked in September.', 'en-US').ok).toBe(true);
    expect(checkOutputLanguage('Rent paid to 华南物业 for August was booked in September.', 'en-US', ['华南物业']).ok).toBe(true);
    expect(checkOutputLanguage('Rent paid to 华南物业 for August was booked in September.', 'en-US').ok).toBe(false);
    expect(checkOutputLanguage('管理费用较上月增加，主要是房租跨期。', 'en-US').ok).toBe(false);
  });

  it('阿语：通过 / 不通过', () => {
    expect(checkOutputLanguage('ارتفعت المصروفات الإدارية بمقدار 48,000.00 بسبب قيد إيجار شهر أغسطس في سبتمبر.', 'ar').ok).toBe(true);
    expect(checkOutputLanguage('Admin expenses rose by 48,000 because of the August rent.', 'ar').ok).toBe(false);
    expect(checkOutputLanguage('管理费用较上月增加 48,000.00 元。', 'ar').ok).toBe(false);
  });

  it('阿语报告里夹着中文科目名必须通过（用户数据不翻译）', () => {
    expect(checkOutputLanguage('ارتفع رصيد 管理费用 بسبب قيد إيجار شهر أغسطس في سبتمبر بمقدار 60,000.00.', 'ar').ok).toBe(true);
    expect(checkOutputLanguage('ارتفع رصيد «管理费用 - 房租» بسبب قيد الإيجار.', 'ar').ok).toBe(true);
  });

  it('只有数字 / 编码时不判错', () => {
    expect(checkOutputLanguage('48,000.00 (INV-009)', 'ar').ok).toBe(true);
  });
});
