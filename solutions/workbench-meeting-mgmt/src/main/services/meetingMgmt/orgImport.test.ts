/**
 * 导入通讯录表格：企微后台导出格式（前面有说明行、部门是完整路径、多部门分号隔开）、自己整理的表格、
 * 部门负责人、直属上级（姓名 / 账号）、手机号规整、提醒。
 */
import { describe, expect, it } from 'vitest';
import { normalizeMobile, normalizeWecomUserId, parseOrgTable } from './orgImport';

describe('parseOrgTable', () => {
  it('企微后台导出的样子：跳过前面的说明行，部门取完整路径的最后一级，多部门取第一个当主部门', () => {
    const rows = [
      ['通讯录导出 2026-11-16'],
      [],
      ['姓名', '帐号', '别名', '职务', '部门', '性别', '手机', '是否部门负责人', '直属上级'],
      ['林晓', 'LinXiao', '', '运营总监', '速腾/运营中心', '女', '13800000001', '是', ''],
      ['周婷', 'ZhouTing', '', '采购经理', '速腾/采购部;速腾/运营中心', '女', '+86 138-0000-0002', '是', '林晓'],
      ['何静', 'HeJing', '', '采购专员', '速腾/采购部', '女', '', '否', 'ZhouTing'],
      ['', '', '', '', '', '', '', '', ''],
    ];
    const r = parseOrgTable(rows);
    expect(r.people.map((p) => p.name)).toEqual(['林晓', '周婷', '何静']);
    expect(r.depts.map((d) => d.name).sort()).toEqual(['运营中心', '采购部']);
    const pur = r.depts.find((d) => d.name === '采购部')!;
    const ops = r.depts.find((d) => d.name === '运营中心')!;
    expect(ops.leaderIds).toEqual(['LinXiao']);
    expect(pur.leaderIds).toEqual(['ZhouTing']);
    const zt = r.people.find((p) => p.name === '周婷')!;
    expect(zt).toMatchObject({ id: 'ZhouTing', wecomUserId: 'ZhouTing', deptId: pur.id, title: '采购经理', mobile: '13800000002', leaderId: 'LinXiao' });
    expect(r.people.find((p) => p.name === '何静')).toMatchObject({ leaderId: 'ZhouTing' });
    expect(r.people.find((p) => p.name === '何静')!.mobile).toBeUndefined();
    expect(r.warnings).toEqual([]);
  });

  it('自己整理的表格：没有账号列也行（按姓名 + 手机号生成本地 id）；没负责人的部门、没法提醒的人都给出提醒', () => {
    const r = parseOrgTable([
      ['姓名', '部门', '手机号'],
      ['张三', '研发部', '13900000001'],
      ['李四', '研发部', '12345'],
      ['王五', '', ''],
    ]);
    expect(r.people).toHaveLength(3);
    expect(r.people[0]!.id).toMatch(/^p_[0-9a-f]{10}$/);
    expect(r.people[0]!.wecomUserId).toBeUndefined();
    expect(r.people[1]!.mobile).toBeUndefined();
    expect(r.people[2]!.deptId).toBe(r.depts.find((d) => d.name === '未分配部门')!.id);
    expect(r.warnings.join('\n')).toContain('2 个部门没有标负责人');
    expect(r.warnings.join('\n')).toContain('1 个手机号格式不对');
    expect(r.warnings.join('\n')).toContain('2 人既没有企微账号也没有手机号');
    // 再导一次 id 不变（离职 / 新增按 id 比）
    expect(parseOrgTable([['姓名', '部门', '手机号'], ['张三', '研发部', '13900000001']]).people[0]!.id).toBe(r.people[0]!.id);
  });

  it('重名的直属上级不认（免得挂错人）；同一个账号出现两次只取第一行', () => {
    const r = parseOrgTable([
      ['姓名', '账号', '部门', '直属上级'],
      ['张伟', 'zw1', 'A', ''],
      ['张伟', 'zw2', 'A', ''],
      ['小李', 'xl', 'A', '张伟'],
      ['小李', 'xl', 'B', ''],
    ]);
    expect(r.people.find((p) => p.id === 'xl')!.leaderId).toBeUndefined();
    expect(r.people.filter((p) => p.id === 'xl')).toHaveLength(1);
    expect(r.warnings.some((w) => w.includes('小李'))).toBe(true);
  });

  it('认不出表头 / 没有人：给出能看懂的原因', () => {
    expect(() => parseOrgTable([['编号', '金额'], ['1', '2']])).toThrow('没认出表头');
    expect(() => parseOrgTable([['姓名', '部门']])).toThrow('没有读到人员');
  });
});

describe('规整', () => {
  it('手机号去掉空格、短横线和大陆的 +86；企微账号只认合法字符', () => {
    expect(normalizeMobile('138 0000 0001')).toBe('13800000001');
    expect(normalizeMobile('+8613800000001')).toBe('13800000001');
    expect(normalizeMobile('0085291234567')).toBe('+85291234567');
    expect(normalizeMobile('abc')).toBe('');
    expect(normalizeWecomUserId('Zhang.San@x')).toBe('Zhang.San@x');
    expect(normalizeWecomUserId('张三')).toBe('');
  });
});
