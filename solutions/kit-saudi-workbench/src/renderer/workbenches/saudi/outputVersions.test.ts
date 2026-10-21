/**
 * 输出中心的版本折叠与删除。
 *
 * 用户实拍：重新生成之后「客户邮件草稿 v2」和「v1」并排堆在列表里，既不覆盖也删不掉。
 * 覆盖不能做 —— 这是合规工作台，审批过、已经发出去的那版必须留痕。
 * 所以定的是：**默认只显示最新一版**（旧版折进「历史版本」）+ **给显式删除**。
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = readFileSync(join(__dirname, 'SaudiWorkbench.vue'), 'utf-8');
const STORE = readFileSync(
  join(__dirname, '..', '..', '..', 'main', 'services', 'saudiCaseStore.ts'), 'utf-8',
);

describe('列表按版本折叠', () => {
  it('渲染的是折叠后的行，不再直接铺 activeCase.outputs', () => {
    expect(SRC).toContain('v-for="row in visibleOutputRows"');
    expect(SRC).not.toContain('v-for="o in activeCase.outputs"');
  });

  it('同名分组只默认展开最新一版', () => {
    const at = SRC.indexOf('const visibleOutputRows');
    const fn = SRC.slice(at, at + 700);
    expect(fn).toContain('rows.push({ o: g.latest, isHistory: false');
    expect(fn).toContain('isOutputHistoryOpen(g.name)');
  });

  it('展开状态换新 Set —— Set.add 不触发响应式，直接改会「点了没反应」', () => {
    const at = SRC.indexOf('function toggleOutputHistory');
    expect(SRC.slice(at, at + 300)).toContain('new Set(expandedOutputHistory.value)');
  });

  it('历史版本入口只挂在最新那一行（旧行 olderCount 为 0）', () => {
    expect(SRC).toContain('v-if="row.olderCount"');
    expect(SRC).toContain("rows.push({ o, isHistory: true, olderCount: 0 })");
  });
});

describe('删除', () => {
  it('每行都有删除入口，且二次确认写清会连磁盘文件一起删', () => {
    expect(SRC).toContain('@click="removeOutput(row.o)"');
    const at = SRC.indexOf('async function removeOutput');
    const fn = SRC.slice(at, at + 900);
    expect(fn).toContain('dialog.confirm');
    expect(fn).toContain('danger: true');
    expect(fn).toContain('不可恢复');
  });

  it('删完重拉整单 —— 只删本地数组的话，输出物卡上的角标还停在旧状态', () => {
    const at = SRC.indexOf('async function removeOutput');
    expect(SRC.slice(at, at + 1200)).toContain('loadCase(activeCase.value.id)');
  });

  it('主进程侧：文件与记录一起清，且进审计（合规工作台删数据必须留痕）', () => {
    const at = STORE.indexOf('deleteOutput(caseId: string');
    expect(at).toBeGreaterThan(0);
    const fn = STORE.slice(at, at + 1800);
    expect(fn).toContain('unlinkSync');
    expect(fn).toContain('exportedPaths');      // 导出/备份目录的拷贝也要删
    expect(fn).toContain("action: i18nT('删除输出物')");
    expect(fn).toContain('this.save()');
  });

  it('删不存在的输出物返回失败，不装作删掉了', () => {
    const at = STORE.indexOf('deleteOutput(caseId: string');
    expect(STORE.slice(at, at + 700)).toContain("message: i18nT('输出物不存在')");
  });

  it('单个文件删不掉（被占用/已被移走）不中断整次删除 —— 删除是幂等动作', () => {
    const at = STORE.indexOf('deleteOutput(caseId: string');
    expect(STORE.slice(at, at + 1800)).toMatch(/catch \{[^}]*\}/);
  });
});

describe('生成仍然按版本递增（不许改成覆盖）', () => {
  it('版本号来自同名文件的已有份数', () => {
    expect(STORE).toContain("const versionNo = record.outputs.filter((o) => o.name === input.name).length + 1;");
  });
});
