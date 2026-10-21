import { afterAll, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as XLSX from 'xlsx';
import rulesJson from './defaultRules.json';
import type { SlaRules } from './calc';
import { parseRulesWorkbook } from './rulesImport';

const base = rulesJson as unknown as SlaRules;
const dir = mkdtempSync(join(tmpdir(), 'fs-rules-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

/** 按客户工作簿的版式写一份真实的 xlsx：表名带空格、CSS 表左右两半、端到端表从第 2 行开始 */
function writeLikeCustomer(file: string, rules: SlaRules, opts: { dropSheet?: string } = {}): void {
  const wb = XLSX.utils.book_new();
  const add = (name: string, aoa: unknown[][], origin = 'A1'): void => {
    if (opts.dropSheet && name.includes(opts.dropSheet)) return;
    const ws = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, aoa, { origin });
    XLSX.utils.book_append_sheet(wb, ws, name);
  };
  add('时效看板指标 ', [['看板指标'], ['指标名称', '取数逻辑', '计算公式', '单位', '备注']]);
  add('端到端用时', [
    ['大类', '流程细类', '流程所属系统', '整体时效要求'],
    ...rules.e2e.map((r) => [r.category, r.flowType, r.system === 'CSS' ? 'css' : r.system,
      r.variants ? r.variants.map((v, i) => `${v.keyword}${v.limitDays}天${i ? '（含合同签订）' : ''}`).join('\n') : r.limitDays === null ? '/' : `${r.limitDays}天`]),
  ], 'A2');
  add('CSS各节点时效要求', [
    ['流程细类', '审核节点', '审核时效要求', '备注', null, '事务类型', '费用类型', '审批节点名', '是否计入端对端时效', '单节点要求（工作日）'],
    ...rules.cssNodes.map((r, i) => [i === 0 ? '产品事故报告' : null, '区域服务经理审批', '3天', null, null, r.flowType, r.feeType || null,
      // 客户表里有的节点名中间带空格
      r.node.length > 6 && i % 9 === 0 ? `${r.node.slice(0, -1)} ${r.node.slice(-1)}` : r.node,
      r.internal ? '内部' : '外部', r.limitWorkdays ?? (r.note ? r.note.replace('；', '\n') : '/')]),
  ]);
  add('oa、费控节点内外部  ', [['流程名', '环节名称', '节点属性'], ...rules.oaFkNodes.map((r) => [r[0], r[1], r[2] ? '内部' : '外部'])]);
  add('oa费控个人节点时效要求', [
    ['审核人身份', '大类', '流程细类', '平台', '金额', '重要性', '时效要求', null],
    ...rules.personal.map((r) => [r.identity, r.category, r.flowType, r.platform, r.amount === 'le10w' ? '10万以内' : r.amount === 'gt10w' ? '10万以上' : '/', r.importance, r.limitDays === null ? '/' : `${r.limitDays}天`]),
  ]);
  add('审核人身份', [['姓名', '身份', '备注'], ...rules.managers.map((n) => [n, '管理干部', null]), ['其他人', '非管理', '以当月人员花名册为准']]);
  XLSX.writeFile(wb, file);
}

describe('导入《时效看板指标》', () => {
  it('按客户版式写出的工作簿，读回来和内置规则一模一样', () => {
    const file = join(dir, '时效看板指标(更新版).xlsx');
    writeLikeCustomer(file, base);
    const { rules, warnings } = parseRulesWorkbook(file, base);
    expect([rules.e2e.length, rules.cssNodes.length, rules.oaFkNodes.length, rules.personal.length, rules.managers.length]).toEqual([35, 76, 669, 31, 11]);
    expect(rules.e2e).toEqual(base.e2e);
    expect(rules.cssNodes).toEqual(base.cssNodes);
    expect(rules.oaFkNodes).toEqual(base.oaFkNodes);
    expect(rules.personal).toEqual(base.personal);
    expect(rules.managers).toEqual(base.managers);
    expect(rules.version).toBe('时效看板指标(更新版)');
    expect(warnings).toEqual([]);
  });

  it('阈值不在工作簿里，沿用传进来的', () => {
    const file = join(dir, 'th.xlsx');
    writeLikeCustomer(file, base);
    const custom = { ...base, riskRatio: 0.7, abnormal: { avgIncreaseDays: 5, minComplianceRate: 0.9 } };
    const { rules } = parseRulesWorkbook(file, custom);
    expect(rules.riskRatio).toBe(0.7);
    expect(rules.abnormal).toEqual({ avgIncreaseDays: 5, minComplianceRate: 0.9 });
    expect(rules.followUp).toEqual(base.followUp);
  });

  it('一格里写两档时效的拆成按标题关键字区分', () => {
    const file = join(dir, 'var.xlsx');
    writeLikeCustomer(file, base);
    const v = parseRulesWorkbook(file, base).rules.e2e.find((r) => r.variants);
    expect(v?.limitDays).toBeNull();
    expect(v?.variants).toEqual([{ keyword: '备用商', limitDays: 7 }, { keyword: '服务商', limitDays: 72 }]);
  });

  it('缺一张表就明说缺哪张，不悄悄用空表', () => {
    const file = join(dir, 'missing.xlsx');
    writeLikeCustomer(file, base, { dropSheet: '个人节点' });
    expect(() => parseRulesWorkbook(file, base)).toThrow(/oa费控个人节点时效要求/);
  });

  it('改了规则再导入，读到的是改后的值', () => {
    const file = join(dir, 'changed.xlsx');
    const changed: SlaRules = JSON.parse(JSON.stringify(base));
    changed.e2e[0].limitDays = 25;
    changed.cssNodes[2].limitWorkdays = 4;
    changed.oaFkNodes[1][2] = true;
    changed.managers = [...changed.managers, '新任经理'];
    writeLikeCustomer(file, changed);
    const { rules } = parseRulesWorkbook(file, base);
    expect(rules.e2e[0].limitDays).toBe(25);
    expect(rules.cssNodes[2].limitWorkdays).toBe(4);
    expect(rules.oaFkNodes[1][2]).toBe(true);
    expect(rules.managers).toContain('新任经理');
  });
});

/** 客户原始工作簿在本机时，直接拿它核对（文件不在仓库里，没有就跳过） */
const CUSTOMER = '/Users/mac02/Desktop/需求/华帝/用服智能化业务场景需求/2-流程时效监控场景需求（何淑玲）/时效看板指标(更新版).xlsx';
describe.skipIf(!existsSync(CUSTOMER))('客户原始工作簿', () => {
  it('导入结果与内置规则一致：35 / 76 / 669 / 31 / 11', () => {
    const { rules } = parseRulesWorkbook(CUSTOMER, base);
    expect([rules.e2e.length, rules.cssNodes.length, rules.oaFkNodes.length, rules.personal.length, rules.managers.length]).toEqual([35, 76, 669, 31, 11]);
    expect(rules.e2e).toEqual(base.e2e);
    expect(rules.cssNodes).toEqual(base.cssNodes);
    expect(rules.oaFkNodes).toEqual(base.oaFkNodes);
    expect(rules.personal).toEqual(base.personal);
    expect(rules.managers).toEqual(base.managers);
    expect(rules.version).toBe(base.version);
  });
});
