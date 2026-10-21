/** 主进程步骤态 → StepCard 运行态的映射（看门狗字段原样透传；阻断 / 中断都落成失败并写人话原因） */
import { describe, expect, it } from 'vitest';
import { lastMonth, stepRuntimeOf } from './shared';

describe('stepRuntimeOf', () => {
  it('running 透传 startedAt / progressAt / kind / estimateSec', () => {
    const r = stepRuntimeOf({ status: 'running', startedAt: 1, progressAt: 2, kind: 'llm', estimateSec: 90 });
    expect(r).toMatchObject({ state: 'running', startedAt: 1, progressAt: 2, kind: 'llm', estimateSec: 90 });
  });
  it('blocked / failed 落成失败并带原因', () => {
    expect(stepRuntimeOf({ status: 'blocked', error: { key: 'x {n}', params: { n: 2 } } })).toMatchObject({ state: 'failed', error: 'x 2' });
    expect(stepRuntimeOf({ status: 'failed' }).state).toBe('failed');
  });
  it('interrupted 显示「已中断」', () => {
    const r = stepRuntimeOf({ status: 'interrupted' });
    expect(r.state).toBe('failed');
    expect(r.error).toBeTruthy();
  });
  it('没有状态时是待执行', () => {
    expect(stepRuntimeOf(undefined)).toEqual({ state: 'todo' });
  });
  it('上个月', () => {
    expect(lastMonth(new Date(2026, 0, 15))).toBe('2025-12');
    expect(lastMonth(new Date(2026, 9, 19))).toBe('2026-09');
  });
});
