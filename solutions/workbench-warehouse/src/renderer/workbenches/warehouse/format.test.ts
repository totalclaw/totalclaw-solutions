import { describe, expect, it } from 'vitest';
import { EMPTY_PLACEHOLDER, formatJson, formatNumber, scalar } from './format';

describe('formatNumber · 正常数字按 locale 分组', () => {
  it('zh-CN / en-US 千分位', () => {
    expect(formatNumber(1234567.891, 'zh-CN')).toBe('1,234,567.891');
    expect(formatNumber(1234567.891, 'en-US')).toBe('1,234,567.891');
  });

  it('de-DE 用点分组逗号小数', () => {
    expect(formatNumber(1234.5, 'de-DE')).toBe('1.234,5');
  });

  it('ar 系 locale 出阿拉伯数字（RTL 界面）且不抛错', () => {
    const out = formatNumber(1234.5, 'ar-EG');
    expect(out.length).toBeGreaterThan(0);
    expect(out).not.toBe(EMPTY_PLACEHOLDER);
  });

  it('数字字符串照样格式化（ERP 常回字符串数字）', () => {
    expect(formatNumber('1000', 'en-US')).toBe('1,000');
    expect(formatNumber(' 2500.75 ', 'en-US')).toBe('2,500.75');
    expect(formatNumber('-42', 'en-US')).toBe('-42');
    expect(formatNumber('1e3', 'en-US')).toBe('1,000');
  });

  it('0 与 -0 显示为 0，不是占位符', () => {
    expect(formatNumber(0, 'en-US')).toBe('0');
    expect(formatNumber('0', 'en-US')).toBe('0');
    expect(formatNumber(-0, 'en-US')).toBe('-0');
  });

  it('bigint 可格式化', () => {
    expect(formatNumber(BigInt(123456), 'en-US')).toBe('123,456');
  });
});

describe('formatNumber · 空值 / 非数字一律占位符，绝不显示成 0', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['空串', ''],
    ['纯空白', '   '],
    ['非数字串', '12abc'],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['-Infinity', -Infinity],
    ['true', true],
    ['false', false],
    ['空数组（Number([])===0 的陷阱）', []],
    ['单元素数组（Number([5])===5 的陷阱）', [5]],
    ['对象', { value: 3 }],
    ['Date', new Date(0)],
    ['函数', () => 1],
    ['Symbol', Symbol('x')],
    ['SQL 注入串', "1; DROP TABLE stock; --"],
    ['HTML', '<b>1</b>'],
  ])('%s → —', (_label, input) => {
    expect(formatNumber(input, 'en-US')).toBe(EMPTY_PLACEHOLDER);
  });

  it('输出里永远不含 NaN / Infinity / undefined 字样', () => {
    const inputs: unknown[] = [NaN, Infinity, -Infinity, undefined, null, 'NaN', 'Infinity', {}, [], 'x'];
    for (const v of inputs) {
      expect(formatNumber(v, 'zh-CN')).not.toMatch(/NaN|Infinity|undefined|null|object/i);
    }
  });
});

describe('formatNumber · locale 参数的容错', () => {
  it('非法 locale 标签不抛错，退回默认 zh-CN 格式', () => {
    expect(() => formatNumber(1234, 'zz-INVALID-!!')).not.toThrow();
    expect(formatNumber(1234, 'zz-INVALID-!!')).toBe('1,234');
  });

  it('空 locale / undefined 走默认', () => {
    expect(formatNumber(1234, '')).toBe('1,234');
    expect(formatNumber(1234, undefined)).toBe('1,234');
  });

  it('超长 locale 串不抛错', () => {
    expect(() => formatNumber(1, 'a'.repeat(10_000))).not.toThrow();
  });
});

describe('formatNumber · 极值', () => {
  it('Number.MAX_SAFE_INTEGER 与极小小数', () => {
    expect(formatNumber(Number.MAX_SAFE_INTEGER, 'en-US')).toBe('9,007,199,254,740,991');
    expect(formatNumber(0.000001, 'en-US')).toBe('0');
    expect(formatNumber(1e21, 'en-US')).toBe('1,000,000,000,000,000,000,000');
  });
});

describe('scalar', () => {
  it.each([
    [null, EMPTY_PLACEHOLDER],
    [undefined, EMPTY_PLACEHOLDER],
    ['', EMPTY_PLACEHOLDER],
    [0, '0'],
    [false, 'false'],
    ['  ', '  '],
    ['SKU-001', 'SKU-001'],
    [12.5, '12.5'],
  ])('scalar(%s) = %s', (input, expected) => {
    expect(scalar(input)).toBe(expected);
  });

  it('对象 / 数组 → 美化 JSON（两空格缩进）', () => {
    expect(scalar({ a: 1 })).toBe('{\n  "a": 1\n}');
    expect(scalar([1, 2])).toBe('[\n  1,\n  2\n]');
  });

  it('循环引用对象不抛错', () => {
    const o: Record<string, unknown> = {};
    o.self = o;
    expect(() => scalar(o)).not.toThrow();
    expect(scalar(o)).toBe('[object Object]');
  });

  it('不转义 HTML —— 转义是模板插值（{{ }}）的职责，这里保证原文不被改写', () => {
    expect(scalar('<b>x</b>')).toBe('<b>x</b>');
  });
});

describe('formatJson', () => {
  it('undefined / 函数（stringify 返回 undefined）退回 String()', () => {
    expect(formatJson(undefined)).toBe('undefined');
    expect(formatJson(() => 1)).toContain('=>');
  });

  it('BigInt（stringify 抛 TypeError）退回 String()', () => {
    expect(formatJson(BigInt(7))).toBe('7');
  });

  it('嵌套结构缩进两格', () => {
    expect(formatJson({ a: { b: [1] } })).toBe('{\n  "a": {\n    "b": [\n      1\n    ]\n  }\n}');
  });

  it('包含 null 原型对象与 toJSON', () => {
    const bare = Object.create(null);
    bare.k = 'v';
    expect(formatJson(bare)).toBe('{\n  "k": "v"\n}');
    expect(formatJson({ toJSON: () => 'custom' })).toBe('"custom"');
  });
});
