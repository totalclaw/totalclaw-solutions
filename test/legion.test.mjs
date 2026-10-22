// 军团清单校验（tools/lib/legion.mjs）+ 仓库里 8 个部门包的约束
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { REPO_ROOT, SOLUTIONS_DIR, listSolutionDirs } from '../tools/lib/common.mjs';
import { validateLegion, validateLegionWorkflow } from '../tools/lib/legion.mjs';

const base = () => ({
  id: 'legion-x',
  kind: 'legion',
  runtime: { mode: 'bundled', runner: 'legion' },
  access: { requiresSolutionGrant: false },
  legion: { short: '测试', color: '#112233', icon: 'x', summary: '测试部门', routingHints: ['测试'], roles: ['a-role', 'b-role'], leadRole: 'a-role', workbenches: [], workflows: [] },
});
const ctx = { solutionIds: new Set(['wb-1']), roleIds: new Set(['a-role', 'b-role']) };

test('合法清单通过', () => {
  assert.deepEqual(validateLegion(base(), '/nonexistent', ctx), []);
});

test('颜色、负责人、角色不存在、工作台不存在、简称过长都报错', () => {
  const m = base();
  m.legion.color = 'red';
  m.legion.leadRole = 'c-role';
  m.legion.roles.push('ghost-role');
  m.legion.workbenches = ['wb-missing'];
  m.legion.short = '一二三四五六七';
  const errs = validateLegion(m, '/nonexistent', ctx).join('\n');
  for (const k of ['color', 'leadRole', 'ghost-role', 'wb-missing', 'short']) assert.match(errs, new RegExp(k));
});

test('找不到 roles 目录时跳过角色存在性，只做格式检查', () => {
  const m = base();
  m.legion.roles = ['a-role', 'not-installed'];
  assert.deepEqual(validateLegion(m, '/nonexistent', { ...ctx, roleIds: null }), []);
});

test('军团包不能单独要求授权', () => {
  const m = base();
  m.access.requiresSolutionGrant = true;
  assert.match(validateLegion(m, '/nonexistent', ctx).join(), /授权/);
});

test('工作流：依赖不存在、成环、本部门角色不在 roles 里', () => {
  const wf = {
    id: 'wf',
    name: 'x',
    steps: [
      { id: 's1', legionId: 'legion-x', roleId: 'a-role', goal: 'g', dependsOn: ['s2'] },
      { id: 's2', legionId: 'legion-x', roleId: 'zzz', goal: 'g', dependsOn: ['s1', 'nope'] },
    ],
  };
  const errs = validateLegionWorkflow(wf, 'legion-x', ['a-role']).join('\n');
  assert.match(errs, /成环/);
  assert.match(errs, /nope/);
  assert.match(errs, /zzz/);
});

test('工作流：跨部门步骤的角色不按本部门 roles 校验', () => {
  const wf = { id: 'wf', name: 'x', steps: [{ id: 's1', legionId: 'legion-other', roleId: 'whatever', goal: 'g', dependsOn: [] }] };
  assert.deepEqual(validateLegionWorkflow(wf, 'legion-x', ['a-role']), []);
});

test('仓库内 8 个部门齐全，颜色互不相同，跨部门工作流指向存在的部门', () => {
  const legions = listSolutionDirs()
    .map((id) => JSON.parse(readFileSync(join(SOLUTIONS_DIR, id, 'solution.json'), 'utf8')))
    .filter((m) => m.kind === 'legion');
  assert.deepEqual(
    legions.map((m) => m.id).sort(),
    ['legion-admin', 'legion-cs', 'legion-finance', 'legion-hr', 'legion-legal', 'legion-ops', 'legion-rd', 'legion-sales'],
  );
  assert.equal(new Set(legions.map((m) => m.legion.color.toLowerCase())).size, legions.length);
  const ids = new Set(legions.map((m) => m.id));
  for (const m of legions) {
    for (const rel of m.legion.workflows) {
      const wf = JSON.parse(readFileSync(join(SOLUTIONS_DIR, m.id, rel), 'utf8'));
      for (const s of wf.steps) assert.ok(ids.has(s.legionId), `${m.id}/${rel} 步骤 ${s.id} 指向未知部门 ${s.legionId}`);
    }
  }
  const index = JSON.parse(readFileSync(join(REPO_ROOT, 'index.json'), 'utf8'));
  assert.ok(index.items.filter((it) => it.kind === 'legion').every((it) => it.legion?.summary), 'index.json 带 legion 段（运营中心未安装时也能列出可用部门）');
});
