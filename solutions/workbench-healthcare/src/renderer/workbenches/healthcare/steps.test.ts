import { describe, expect, it, vi } from 'vitest';
import {
  HEALTHCARE_STEP_IDS,
  buildHealthcareSteps,
  clampHealthcareStep,
  toCount,
  type HealthcareStepState,
} from './steps';

/** 恒等翻译：把 params 拼进去便于断言（模拟 vue-i18n 的占位替换）。 */
const t = (key: string, params?: Record<string, unknown>): string =>
  params ? key.replace(/\{(\w+)\}/g, (_, k) => String(params[k])) : key;

const empty: HealthcareStepState = {
  statusOk: false,
  maskResult: null,
  reviewCount: 0,
  pendingCount: 0,
  audit: null,
};

describe('buildHealthcareSteps · 基本结构', () => {
  it('恒为四步，id 1..4 顺序固定，label 与 demo 文案一致', () => {
    const steps = buildHealthcareSteps(empty, t);
    expect(steps.map((s) => s.id)).toEqual([1, 2, 3, 4]);
    expect(steps.map((s) => s.label)).toEqual(['状态与边界', 'PHI 脱敏', '人工复核', '审计导出']);
    expect(steps.every((s) => typeof s.sub === 'string' && s.sub.length > 0)).toBe(true);
  });

  it('空状态：四步全部未完成，副标题是「待…」', () => {
    const steps = buildHealthcareSteps(empty, t);
    expect(steps.map((s) => s.done)).toEqual([false, false, false, false]);
    expect(steps[0].sub).toBe('待检查');
    expect(steps[1].sub).toBe('待处理文本');
    expect(steps[2].sub).toBe('待复核 0 项');
    expect(steps[3].sub).toBe('未导出');
  });

  it('全部完成：done 全 true，副标题带真实数字', () => {
    const steps = buildHealthcareSteps({
      statusOk: true,
      maskResult: { sessionId: 'abc', maskedText: '***' },
      reviewCount: 5,
      pendingCount: 2,
      audit: { lineCount: 37, auditJsonl: '{}' },
    }, t);
    expect(steps.map((s) => s.done)).toEqual([true, true, true, true]);
    expect(steps[0].sub).toBe('合规能力已连接');
    expect(steps[1].sub).toBe('已建立可逆会话');
    expect(steps[2].sub).toBe('待复核 2 项');
    expect(steps[3].sub).toBe('37 行已导出');
  });

  it('翻译函数只收到固定 key，绝不把后端数据拼进 key（防 i18n 注入）', () => {
    const spy = vi.fn(t);
    buildHealthcareSteps({
      statusOk: true,
      maskResult: { maskedText: '<script>alert(1)</script>' },
      reviewCount: '{n}',
      pendingCount: '${process.env.HOME}',
      audit: { lineCount: '<img onerror=x>' },
    }, spy);
    const keys = spy.mock.calls.map((c) => c[0]);
    for (const key of keys) {
      expect(key).not.toMatch(/script|process|onerror/);
    }
    expect(new Set(keys).size).toBe(keys.length); // 每个 key 只用一次
  });
});

describe('buildHealthcareSteps · statusOk 只认严格 true', () => {
  it.each([
    ['字符串 "true"', 'true'],
    ['字符串 "false"', 'false'],
    ['数字 1', 1],
    ['对象', { ok: true }],
    ['数组', [true]],
    ['undefined', undefined],
    ['null', null],
  ])('%s → 第一步未完成', (_label, statusOk) => {
    const [first] = buildHealthcareSteps({ ...empty, statusOk }, t);
    expect(first.done).toBe(false);
    expect(first.sub).toBe('待检查');
  });
});

describe('buildHealthcareSteps · maskResult 判定', () => {
  it.each([
    ['null', null, false],
    ['undefined', undefined, false],
    ['false', false, false],
    ['空对象也算已脱敏（后端返回了结果）', {}, true],
    ['字符串结果', 'masked', true],
    ['数字 0（后端异常返回）', 0, true],
  ])('%s', (_label, maskResult, done) => {
    const steps = buildHealthcareSteps({ ...empty, maskResult }, t);
    expect(steps[1].done).toBe(done);
  });
});

describe('buildHealthcareSteps · 复核计数的恶意 / 边界输入', () => {
  it.each([
    ['NaN', NaN, 0],
    ['负数', -3, 0],
    ['Infinity', Infinity, 0],
    ['-Infinity', -Infinity, 0],
    ['数字字符串', '7', 7],
    ['带空格数字字符串', ' 12 ', 12],
    ['非数字字符串', '12abc', 0],
    ['空字符串', '', 0],
    ['小数向下取整', 2.9, 2],
    ['对象', { length: 5 }, 0],
    ['数组', [1, 2, 3], 0],
    ['布尔 true', true, 0],
    ['null', null, 0],
    ['超大数被夹到上限', 1e300, 1e12],
    ['bigint', BigInt(4), 4],
  ])('pendingCount=%s → 副标题数字 %i', (_label, pendingCount, expected) => {
    const steps = buildHealthcareSteps({ ...empty, pendingCount, reviewCount: pendingCount }, t);
    expect(steps[2].sub).toBe(`待复核 ${expected} 项`);
    expect(steps[2].sub).not.toMatch(/NaN|Infinity|undefined|object/);
    expect(steps[2].done).toBe(expected > 0);
  });

  it('reviewCount > 0 但 pendingCount = 0：步骤完成、待复核 0 项（全部已处理）', () => {
    const steps = buildHealthcareSteps({ ...empty, reviewCount: 3, pendingCount: 0 }, t);
    expect(steps[2].done).toBe(true);
    expect(steps[2].sub).toBe('待复核 0 项');
  });

  it('pendingCount 大于 reviewCount（后端不一致）不抛错，按各自数值显示', () => {
    const steps = buildHealthcareSteps({ ...empty, reviewCount: 1, pendingCount: 9 }, t);
    expect(steps[2].done).toBe(true);
    expect(steps[2].sub).toBe('待复核 9 项');
  });
});

describe('buildHealthcareSteps · 审计导出', () => {
  it('audit 有对象但 lineCount 缺失 / 非法 → 「0 行已导出」且 done=true', () => {
    for (const lineCount of [undefined, null, 'abc', -1, NaN, {}]) {
      const steps = buildHealthcareSteps({ ...empty, audit: { lineCount } }, t);
      expect(steps[3].done).toBe(true);
      expect(steps[3].sub).toBe('0 行已导出');
    }
  });

  it('audit 为字符串 / 数字等非对象 → 视为未导出', () => {
    for (const audit of ['done', 42, true] as unknown[]) {
      const steps = buildHealthcareSteps({ ...empty, audit: audit as never }, t);
      expect(steps[3].done).toBe(false);
      expect(steps[3].sub).toBe('未导出');
    }
  });

  it('lineCount 为数字字符串 "3" → 3 行', () => {
    const steps = buildHealthcareSteps({ ...empty, audit: { lineCount: '3' } }, t);
    expect(steps[3].sub).toBe('3 行已导出');
  });
});

describe('buildHealthcareSteps · 纯函数性质', () => {
  it('不修改入参、连续调用结果相同且互不共享引用', () => {
    const state: HealthcareStepState = { ...empty, reviewCount: 2, pendingCount: 1 };
    const frozen = Object.freeze({ ...state });
    const a = buildHealthcareSteps(frozen, t);
    const b = buildHealthcareSteps(frozen, t);
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
    expect(a[0]).not.toBe(b[0]);
    expect(frozen).toEqual(state);
  });

  it('翻译函数抛错时原样抛出（不吞错、不返回半截步骤）', () => {
    const boom = (): string => { throw new Error('i18n down'); };
    expect(() => buildHealthcareSteps(empty, boom)).toThrow('i18n down');
  });
});

describe('toCount', () => {
  it.each([
    [0, 0], [1, 1], ['3', 3], ['0x10', 16], ['1e3', 1000], [1e12 + 5, 1e12],
    [-0, 0], ['-0', 0], [' \t9\n', 9], [Symbol('x'), 0], [() => 5, 0],
  ])('toCount(%s) = %i', (input, expected) => {
    expect(toCount(input)).toBe(expected);
  });

  it('返回值永远是安全的非负整数', () => {
    const samples: unknown[] = [NaN, -1, 1.5, '2.7', 1e400, -1e400, undefined, null, {}, [], 'abc', true, false];
    for (const s of samples) {
      const n = toCount(s);
      expect(Number.isSafeInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('clampHealthcareStep', () => {
  it('合法 id 原样返回', () => {
    for (const id of HEALTHCARE_STEP_IDS) expect(clampHealthcareStep(id)).toBe(id);
  });

  it.each([
    ['0', 0], ['5', 5], ['-1', -1], ['2.5', 2.5], ['NaN', NaN], ['Infinity', Infinity],
    ['字符串 "2"', '2'], ['null', null], ['undefined', undefined], ['对象', { id: 2 }], ['数组 [2]', [2]],
  ])('%s → 回到第 1 步', (_label, input) => {
    expect(clampHealthcareStep(input)).toBe(1);
  });
});
