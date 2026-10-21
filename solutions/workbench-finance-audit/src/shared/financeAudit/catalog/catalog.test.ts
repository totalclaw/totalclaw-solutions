/**
 * 模块目录守卫（docs/finance-audit-solution.md 第 4.2 节）：
 *   ① 48 条齐全、id / 编号唯一；
 *   ② sourceInventory.json 里每个源模块都有归属，每个模块至少一条来源；
 *   ③ status=ready 的模块，其 modes[].skills 引用的技能目录真实存在。
 */
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { FAU_MODULES, SOURCE_INVENTORY, moduleByCode } from './index';

const SKILLS = join(resolve(__dirname, '../../../../../..'), 'resources/bundled-skills/finance-audit');

describe('财会审计模块目录', () => {
  it('48 个模块，id 与编号唯一，七个分组数量与设计稿一致', () => {
    expect(FAU_MODULES).toHaveLength(48);
    expect(new Set(FAU_MODULES.map((m) => m.id)).size).toBe(48);
    expect(new Set(FAU_MODULES.map((m) => m.code)).size).toBe(48);
    const per = (g: string) => FAU_MODULES.filter((m) => m.group === g).length;
    expect(['platform', 'accounting', 'audit', 'tax', 'fpa', 'treasury', 'capital'].map(per)).toEqual([6, 8, 6, 3, 10, 7, 8]);
  });

  it('源模块清单每一条都归到目录里存在的模块，每个模块至少一条来源', () => {
    expect(SOURCE_INVENTORY.items.length).toBeGreaterThan(500);
    for (const i of SOURCE_INVENTORY.items) expect(moduleByCode(i.module), `${i.type} ${i.path}`).toBeTruthy();
    for (const m of FAU_MODULES) expect(m.provenance.length, `${m.code} ${m.id}`).toBeGreaterThan(0);
  });

  it('ready 模块引用的技能目录都存在', () => {
    const ready = FAU_MODULES.filter((m) => m.status === 'ready');
    expect(ready.length).toBeGreaterThan(0);
    for (const m of ready) {
      for (const mode of m.modes) for (const s of mode.skills) expect(existsSync(join(SKILLS, s, 'SKILL.md')), `${m.code} ${mode.id} → ${s}`).toBe(true);
    }
  });
});
