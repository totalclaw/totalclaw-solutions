import { describe, expect, it } from 'vitest';
import { addDays, cnToInt, daysBetween, endOfDayMs, fmtClock, guardNumbers, isDateStr, numberTokens, parseLlmJson, splitSentences } from './util';

describe('parseLlmJson', () => {
  it('直接 JSON / 代码围栏 / 前后有废话 / 思考块', () => {
    expect(parseLlmJson('{"a":1}')).toEqual({ a: 1 });
    expect(parseLlmJson('```json\n{"a":[1,2]}\n```')).toEqual({ a: [1, 2] });
    expect(parseLlmJson('好的，结果如下：{"a":"x}y"} 希望有帮助')).toEqual({ a: 'x}y' });
    expect(parseLlmJson('<think>{"no":1}</think>{"yes":2}')).toEqual({ yes: 2 });
    expect(parseLlmJson('[1,2,3]')).toEqual([1, 2, 3]);
  });
  it('不是 JSON / null 返回 null', () => {
    expect(parseLlmJson(null)).toBeNull();
    expect(parseLlmJson('模型暂时不可用')).toBeNull();
    expect(parseLlmJson('{"a":')).toBeNull();
  });
});

describe('日期', () => {
  it('合法性、加减天数、相差天数', () => {
    expect(isDateStr('2026-02-29')).toBe(false);
    expect(isDateStr('2028-02-29')).toBe(true);
    expect(addDays('2026-12-25', 14)).toBe('2027-01-08');
    expect(daysBetween('2026-11-16', '2026-11-30')).toBe(14);
    expect(endOfDayMs('2026-11-16')).toBe(new Date(2026, 10, 16, 23, 59, 59, 999).getTime());
    expect(fmtClock(3723.9)).toBe('01:02:03');
  });
});

describe('数字回核', () => {
  it('中文数字只认「数 + 量词」，序数「第一」不算', () => {
    expect(cnToInt('三十五')).toBe(35);
    expect(cnToInt('一百零二')).toBe(102);
    expect(cnToInt('两千')).toBe(2000);
    expect(cnToInt('二〇二六')).toBe(2026);
    expect(numberTokens('完成 3 项，共十二个部门，第一项保持一致')).toEqual(['3', '12']);
    expect(numberTokens('完成率 85.0%')).toEqual(['85']);
  });

  it('含材料里没有的数字的句子整句删掉，列表符号不算数字', () => {
    const allowed = '任务 10 项，完成 6 项，逾期 2 项';
    const r = guardNumbers('本周完成 6 项任务。还有 3 项即将到期。逾期两项需要跟进。\n1. 研发部进展顺利。', allowed);
    expect(r.text).toBe('本周完成 6 项任务。逾期两项需要跟进。\n1. 研发部进展顺利。');
    expect(r.dropped).toBe(1);
  });

  it('切句保留句末标点', () => {
    expect(splitSentences('决定上线。谁负责？张三！好的')).toEqual(['决定上线。', '谁负责？', '张三！', '好的']);
  });
});
