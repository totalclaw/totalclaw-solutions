/**
 * 数据包：规则版本、改动审计、Excel 导入。
 *
 * 三条需求硬要求逐条钉：
 *   改了规则必须 bump 版本（否则事后对账分不清数字按哪版算）
 *   没实质改动不许 bump（否则版本号变噪音）
 *   Excel 导入认表头而不是认列序（列序法必错）
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  bumpVersion, DEFAULT_DATA_PACK, diffPack, mergeWithDefaults, productsFromGrid, SaudiDataPackStore,
} from './saudiDataPack';

let home: string;
let store: SaudiDataPackStore;

beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), 'tc-pack-'));
  store = new SaudiDataPackStore({ totalclawHome: home });
});
afterEach(() => rmSync(home, { recursive: true, force: true }));

describe('版本号', () => {
  it('小版本递增，认不出格式时不停在原地', () => {
    expect(bumpVersion('v1.3')).toBe('v1.4');
    expect(bumpVersion('1.9')).toBe('v1.10');
    expect(bumpVersion('乱写')).toBe('v1.1');
    expect(bumpVersion('')).toBe('v1.1');
  });
});

describe('与默认值合并', () => {
  it('老存档缺字段时补齐（加了新规则项也读得出来）', () => {
    const pack = mergeWithDefaults({ version: 'v2.0', rules: { targetMargin: 0.15 } });
    expect(pack.version).toBe('v2.0');
    expect(pack.rules.targetMargin).toBe(0.15);
    // 没给的规则项走默认
    expect(pack.rules.riskRate).toBe(DEFAULT_DATA_PACK.rules.riskRate);
    // 地点系数是逐键合并，不是整块覆盖
    expect(pack.rules.distanceFactor.tabuk).toBe(2.35);
    expect(pack.products.length).toBeGreaterThan(0);
  });

  it('产品目录给了就用给的，不掺默认', () => {
    const pack = mergeWithDefaults({ products: [{ sku: 'X-1', unitCost: '99' }] });
    expect(pack.products).toHaveLength(1);
    expect(pack.products[0].unitCost).toBe(99);
    expect(pack.products[0].unit).toBe('台');
  });
});

describe('保存与版本 bump', () => {
  it('改了毛利 → 版本 bump + 改动清单可读', () => {
    const before = store.get().version;
    const result = store.save({ rules: { ...store.get().rules, targetMargin: 0.16 } }, 'A. Malik');
    expect(result.changed).toBe(true);
    expect(result.pack.version).not.toBe(before);
    expect(result.changes.join()).toContain('目标毛利率');
    expect(result.pack.updatedBy).toBe('A. Malik');
  });

  it('没有实质改动 → 不 bump、不写审计噪音', () => {
    const before = store.get();
    const result = store.save({ rules: before.rules, products: before.products }, 'A. Malik');
    expect(result.changed).toBe(false);
    expect(result.pack.version).toBe(before.version);
    expect(result.changes).toEqual([]);
  });

  it('落盘后重新构造能读回来', () => {
    store.save({ rules: { ...store.get().rules, installUnitCost: 1500 } });
    const reopened = new SaudiDataPackStore({ totalclawHome: home });
    expect(reopened.get().rules.installUnitCost).toBe(1500);
    expect(existsSync(join(home, 'saudi', 'data-pack.json'))).toBe(true);
  });

  it('恢复出厂：内容回默认但版本继续往前走（不能回退）', () => {
    store.save({ rules: { ...store.get().rules, targetMargin: 0.05 } });
    const bumped = store.get().version;
    const reset = store.reset('管理员');
    expect(reset.rules.targetMargin).toBe(DEFAULT_DATA_PACK.rules.targetMargin);
    expect(reset.version).not.toBe(bumped);
    expect(reset.version).toBe(bumpVersion(bumped));
  });

  it('存档损坏时回落默认而不是崩', () => {
    writeFileSync(join(home, 'saudi', 'data-pack.json'), '{ 坏 json', 'utf-8');
    const reopened = new SaudiDataPackStore({ totalclawHome: home });
    expect(reopened.get().rules.targetMargin).toBe(DEFAULT_DATA_PACK.rules.targetMargin);
  });
});

describe('Excel 导入产品目录', () => {
  it('认表头而不是认列序（列顺序换了照样对）', () => {
    const { products, error } = productsFromGrid([
      ['我司产品清单', '', '', ''],
      ['描述', '采购价', 'SKU', '交期'],
      ['4K 筒机', '7,450', 'IPC-4K-BLT-30', '2 周'],
      ['24 口 PoE', '9800', 'SW-POE-24-370', '4 周'],
    ]);
    expect(error).toBeUndefined();
    expect(products).toHaveLength(2);
    expect(products[0].sku).toBe('IPC-4K-BLT-30');
    // 带千分位的价格要能读成数字
    expect(products[0].unitCost).toBe(7450);
    expect(products[0].leadTime).toBe('2 周');
  });

  it('库存列写"不足"时自动标缺货（触发供应卡的替代建议）', () => {
    const { products } = productsFromGrid([
      ['SKU', '单价', '库存'],
      ['SW-POE-24-370', '9800', '不足（现货 2）'],
      ['IPC-4K-BLT-30', '7450', '充足'],
    ]);
    expect(products[0].stockShort).toBe(true);
    expect(products[1].stockShort).toBe(false);
  });

  it('没有表头 / 缺关键列时明确报错，不去猜', () => {
    expect(productsFromGrid([['随便', '写点'], ['a', 'b']]).error).toContain('表头');
    expect(productsFromGrid([['SKU', '描述'], ['X-1', '无单价']]).error).toContain('单价');
    expect(productsFromGrid([]).error).toBeTruthy();
  });

  it('表头认出来但没有数据行时报错，而不是导入空目录把报价清零', () => {
    expect(productsFromGrid([['SKU', '单价']]).error).toContain('有效数据行');
  });
});

describe('改动清单', () => {
  it('逐项列出规则差异，供审计直接引用', () => {
    const before = mergeWithDefaults(null);
    const after = mergeWithDefaults({ rules: { ...before.rules, riskRate: 0.05 }, products: before.products.slice(0, 3) });
    const changes = diffPack(before, after);
    expect(changes.join()).toContain('风险准备金费率');
    expect(changes.join()).toContain('产品目录');
  });
});
