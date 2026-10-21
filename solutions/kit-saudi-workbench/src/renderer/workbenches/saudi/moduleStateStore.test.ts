import { describe, expect, it } from 'vitest';
import { defaultState } from './demoData';
import {
  clearModuleState, moduleStateKey, readModuleState, writeModuleState, type KeyValueStore,
} from './moduleStateStore';

function memStore(): KeyValueStore & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => { map.set(k, v); },
    removeItem: (k) => { map.delete(k); },
  };
}

describe('现场变更状态按案件隔离', () => {
  it('在 A 单做的变更不会漏到 B 单（用户实证的 bug）', () => {
    const store = memStore();
    writeModuleState(store, 'rfq-quote', 'caseA', {
      ...defaultState('rfq-quote'), location: 'tabuk', locationLabel: 'Tabuk', warrantyYears: 3,
    });
    const b = readModuleState(store, 'rfq-quote', 'caseB');
    expect(b.location, 'B 单不该继承 A 单的交付地点').toBe('jeddah');
    expect(b.warrantyYears).toBe(2);
  });

  it('切回 A 单还能看到它自己的变更（审计写了改成塔布克，卡片就得是塔布克）', () => {
    const store = memStore();
    writeModuleState(store, 'rfq-quote', 'caseA', {
      ...defaultState('rfq-quote'), location: 'tabuk', warrantyYears: 3,
    });
    const a = readModuleState(store, 'rfq-quote', 'caseA');
    expect(a.location).toBe('tabuk');
    expect(a.warrantyYears).toBe(3);
  });

  it('同一案件号在不同模块之间也不串（三个模块共用这套底座）', () => {
    const store = memStore();
    writeModuleState(store, 'rfq-quote', 'same-id', { ...defaultState('rfq-quote'), warrantyYears: 3 });
    expect(readModuleState(store, 'bid-decision', 'same-id').warrantyYears)
      .toBe(defaultState('bid-decision').warrantyYears);
  });

  it('没存过就是默认值', () => {
    expect(readModuleState(memStore(), 'advisory-report', 'fresh'))
      .toEqual(defaultState('advisory-report'));
  });

  it('存坏了也回默认值 —— 一条脏数据不能把这一单卡住开不了', () => {
    const store = memStore();
    store.setItem(moduleStateKey('rfq-quote', 'broken'), '{not json');
    expect(readModuleState(store, 'rfq-quote', 'broken')).toEqual(defaultState('rfq-quote'));
  });

  it('部分字段的旧存档能与新默认值合并（加了新字段不该让老案件炸）', () => {
    const store = memStore();
    store.setItem(moduleStateKey('rfq-quote', 'partial'), JSON.stringify({ warrantyYears: 3 }));
    const got = readModuleState(store, 'rfq-quote', 'partial');
    expect(got.warrantyYears).toBe(3);
    expect(got.bomVariant).toBe(defaultState('rfq-quote').bomVariant);
  });

  it('重置演示会清掉该案件的存档，切走再切回不会诈尸', () => {
    const store = memStore();
    writeModuleState(store, 'rfq-quote', 'caseA', { ...defaultState('rfq-quote'), warrantyYears: 3 });
    clearModuleState(store, 'rfq-quote', 'caseA');
    expect(readModuleState(store, 'rfq-quote', 'caseA').warrantyYears).toBe(2);
  });

  it('没有案件 id 时不写不读（收件箱阶段还没建案）', () => {
    const store = memStore();
    writeModuleState(store, 'rfq-quote', '', { ...defaultState('rfq-quote'), warrantyYears: 3 });
    expect(store.map.size).toBe(0);
  });
});
